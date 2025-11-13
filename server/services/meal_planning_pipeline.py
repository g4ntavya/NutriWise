"""
Meal Planning Pipeline
Orchestrates the complete workflow: LLM + Deterministic Code
"""
from typing import Dict, List, Optional
from server.services.user_onboarding import OnboardingService, UserProfile
from server.services.llm_interaction import LLMInteractionService
from server.services.vector_service import NutritionVectorizer, CosineSimilarityRecommender
from server.services.pricing_analyzer import PricingAnalyzer
from server.services.nutrition_validator import NutritionValidator
from server.services.supabase_client import get_supabase_client

class MealPlanningPipeline:
    """
    Complete meal planning pipeline
    Combines LLM (creative tasks) with deterministic code (validation)
    """
    
    def __init__(self):
        self.onboarding = OnboardingService()
        self.llm = LLMInteractionService()
        self.vectorizer = NutritionVectorizer()
        self.recommender = CosineSimilarityRecommender()
        self.pricing = PricingAnalyzer()
        self.nutrition = NutritionValidator()
        self.supabase = get_supabase_client()
    
    async def process_user_onboarding(
        self,
        user_input: Dict,
        user_id: str
    ) -> Dict:
        """
        Step 1: User Onboarding
        DETERMINISTIC CODE: Profile validation and metric calculation
        """
        # Create user profile
        profile = UserProfile(**user_input)
        
        # Calculate all metrics (DETERMINISTIC)
        complete_profile = self.onboarding.create_complete_profile(profile)
        
        # Save to database
        user_data = {
            "id": user_id,
            "email": user_input.get("email"),
            "name": user_input.get("name"),
            "profile_data": complete_profile["profile"],
            "calculated_metrics": complete_profile["calculated_metrics"],
            "nutrition_constraints": complete_profile["nutrition_constraints"],
            "budget_constraints": complete_profile["budget_constraints"]
        }
        
        self.supabase.table("users").upsert(user_data, on_conflict="id").execute()
        
        return complete_profile
    
    async def parse_natural_language_request(
        self,
        user_message: str,
        user_id: str
    ) -> Dict:
        """
        Step 2: Parse User Request
        LLM TASK: Understand natural language
        """
        # Get current profile
        user_response = self.supabase.table("users").select("*").eq("id", user_id).execute()
        current_profile = user_response.data[0] if user_response.data else None
        
        # LLM parses the request
        parsed_request = self.llm.parse_user_request(user_message, current_profile)
        
        return parsed_request
    
    async def generate_meal_plan(
        self,
        user_id: str,
        duration_days: int = 7,
        use_natural_language: Optional[str] = None
    ) -> Dict:
        """
        Complete meal planning workflow
        
        Workflow:
        1. Get user profile (DETERMINISTIC)
        2. Parse request if natural language (LLM)
        3. Create user vector (DETERMINISTIC)
        4. Find similar recipes (DETERMINISTIC - cosine similarity)
        5. Generate recipe suggestions (LLM)
        6. Generate meal plan (LLM)
        7. Validate nutrition (DETERMINISTIC)
        8. Validate pricing (DETERMINISTIC)
        9. Optimize if needed (DETERMINISTIC)
        """
        
        # Step 1: Get user profile (DETERMINISTIC)
        user_response = self.supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_response.data:
            raise ValueError("User profile not found")
        
        user_data = user_response.data[0]
        profile = user_data.get("profile_data", {})
        nutrition_constraints = user_data.get("nutrition_constraints", {})
        budget_constraints = user_data.get("budget_constraints", {})
        
        # Step 2: Parse natural language if provided (LLM)
        if use_natural_language:
            parsed = await self.parse_natural_language_request(use_natural_language, user_id)
            # Update constraints based on parsed request
            if parsed.get("calorie_target"):
                nutrition_constraints["daily_calories"] = parsed["calorie_target"]
            if parsed.get("dietary_preferences"):
                nutrition_constraints["dietary_restrictions"] = parsed["dietary_preferences"]
        
        # Step 3: Create user preference vector (DETERMINISTIC)
        user_vector = self.vectorizer.create_user_preference_vector(
            calorie_target=nutrition_constraints.get("daily_calories", 2000),
            protein_ratio=0.3,
            carbs_ratio=0.4,
            fat_ratio=0.3
        )
        
        # Step 4: Fetch recipes and create vectors (DETERMINISTIC)
        recipes = await self._fetch_recipes(nutrition_constraints)
        recipe_vectors = self._create_recipe_vectors(recipes)
        
        # Step 5: Find similar recipes using cosine similarity (DETERMINISTIC)
        similar_recipes = self.recommender.find_similar_recipes(
            user_vector,
            recipe_vectors,
            top_k=20
        )
        
        # Get recommended recipe data
        recommended_recipes = self._prepare_recommended_recipes(
            similar_recipes,
            recipes
        )
        
        # Step 6: Generate recipe suggestions (LLM - creative task)
        llm_suggestions = self.llm.generate_recipe_suggestions(
            nutrition_constraints=nutrition_constraints,
            dietary_preferences=nutrition_constraints.get("dietary_restrictions", []),
            preferred_cuisines=profile.get("preferred_cuisines", []),
            num_suggestions=10
        )
        
        # Combine LLM suggestions with similarity-based recommendations
        all_recommendations = recommended_recipes + llm_suggestions
        
        # Step 7: Generate meal plan (LLM - creative task)
        meal_plan = self.llm.generate_meal_plan_from_recommendations(
            user_profile=profile,
            nutrition_constraints=nutrition_constraints,
            recommended_recipes=all_recommendations,
            budget_constraints=budget_constraints,
            duration_days=duration_days
        )
        
        # Step 8: Validate nutrition (DETERMINISTIC)
        nutrition_validation = self._validate_meal_plan_nutrition(
            meal_plan,
            nutrition_constraints
        )
        
        # Step 9: Validate pricing (DETERMINISTIC)
        pricing_validation = self._validate_meal_plan_pricing(
            meal_plan,
            budget_constraints
        )
        
        # Step 10: Optimize if needed (DETERMINISTIC)
        if not nutrition_validation["overall_valid"] or not pricing_validation["within_budget"]:
            meal_plan = self._optimize_meal_plan(
                meal_plan,
                nutrition_constraints,
                budget_constraints
            )
            # Re-validate
            nutrition_validation = self._validate_meal_plan_nutrition(
                meal_plan,
                nutrition_constraints
            )
            pricing_validation = self._validate_meal_plan_pricing(
                meal_plan,
                budget_constraints
            )
        
        # Step 11: Save meal plan
        meal_plan_data = {
            "user_id": user_id,
            "title": f"Meal Plan - {duration_days} days",
            "calorie_target": nutrition_constraints.get("daily_calories"),
            "budget": budget_constraints.get("weekly_budget_inr"),
            "duration_days": duration_days,
            "meal_plan_data": meal_plan,
            "validation": {
                "nutrition": nutrition_validation,
                "pricing": pricing_validation
            }
        }
        
        response = self.supabase.table("meal_plans").insert(meal_plan_data).execute()
        meal_plan["id"] = response.data[0]["id"] if response.data else None
        
        return {
            "meal_plan": meal_plan,
            "validation": {
                "nutrition": nutrition_validation,
                "pricing": pricing_validation
            },
            "recommendations_used": len(recommended_recipes),
            "llm_suggestions_used": len(llm_suggestions)
        }
    
    async def _fetch_recipes(self, nutrition_constraints: Dict) -> List[Dict]:
        """Fetch recipes from database"""
        query = self.supabase.table("recipes").select("*")
        
        # Filter by dietary restrictions
        restrictions = nutrition_constraints.get("dietary_restrictions", [])
        if "VEGETARIAN" in restrictions:
            query = query.not_.like("tags", "%non-vegetarian%")
        
        response = query.limit(100).execute()
        return response.data or []
    
    def _create_recipe_vectors(self, recipes: List[Dict]) -> List[tuple]:
        """Create nutrition vectors for recipes"""
        recipe_vectors = []
        
        for recipe in recipes:
            vector = self.vectorizer.create_ingredient_vector(
                calories=recipe.get("calories", 0),
                protein=recipe.get("protein", 0),
                carbs=recipe.get("carbs", 0),
                fat=recipe.get("fat", 0)
            )
            recipe_vectors.append((recipe["id"], vector))
        
        return recipe_vectors
    
    def _prepare_recommended_recipes(
        self,
        similar_recipes: List[tuple],
        all_recipes: List[Dict]
    ) -> List[Dict]:
        """Prepare recommended recipes data"""
        recipe_dict = {r["id"]: r for r in all_recipes}
        recommended = []
        
        for recipe_id, similarity_score in similar_recipes:
            if recipe_id in recipe_dict:
                recipe = recipe_dict[recipe_id].copy()
                recipe["similarity_score"] = similarity_score
                recommended.append(recipe)
        
        return recommended
    
    def _validate_meal_plan_nutrition(
        self,
        meal_plan: Dict,
        nutrition_constraints: Dict
    ) -> Dict:
        """Validate nutrition (DETERMINISTIC)"""
        all_validations = []
        
        for day in meal_plan.get("days", []):
            meals = day.get("meals", [])
            
            # Calculate daily nutrition
            daily_nutrition = self.nutrition.calculate_daily_nutrition(meals)
            
            # Validate
            validation = self.nutrition.validate_against_constraints(
                daily_nutrition,
                nutrition_constraints
            )
            all_validations.append(validation)
        
        # Overall validation
        overall_valid = all(v["overall_valid"] for v in all_validations)
        
        return {
            "overall_valid": overall_valid,
            "daily_validations": all_validations
        }
    
    def _validate_meal_plan_pricing(
        self,
        meal_plan: Dict,
        budget_constraints: Dict
    ) -> Dict:
        """Validate pricing (DETERMINISTIC)"""
        cost_analysis = self.pricing.calculate_meal_plan_cost(
            meal_plan,
            budget_constraints.get("region")
        )
        
        budget_validation = self.pricing.validate_budget(
            cost_analysis["total_cost"],
            budget_constraints.get("weekly_budget_inr", 0)
        )
        
        return {
            "within_budget": budget_validation["within_budget"],
            "cost_analysis": cost_analysis,
            "budget_validation": budget_validation
        }
    
    def _optimize_meal_plan(
        self,
        meal_plan: Dict,
        nutrition_constraints: Dict,
        budget_constraints: Dict
    ) -> Dict:
        """
        Optimize meal plan to meet constraints
        DETERMINISTIC OPTIMIZATION
        """
        # Simple optimization: adjust portion sizes
        for day in meal_plan.get("days", []):
            daily_calories = sum(m.get("estimatedCalories", 0) for m in day.get("meals", []))
            target_calories = nutrition_constraints.get("daily_calories", 2000)
            
            if daily_calories > 0:
                scale_factor = target_calories / daily_calories
                
                for meal in day.get("meals", []):
                    meal["estimatedCalories"] *= scale_factor
                    meal["estimatedCost"] *= scale_factor
                    if "estimatedNutrition" in meal:
                        for key in meal["estimatedNutrition"]:
                            meal["estimatedNutrition"][key] *= scale_factor
        
        return meal_plan

