"""
Recommendation service combining cosine similarity and Gemini AI
Main workflow: User input → Vector creation → Similarity matching → Gemini prediction
"""
from typing import List, Dict, Optional
import numpy as np
from server.services.vector_service import (
    NutritionVectorizer,
    CosineSimilarityRecommender
)
from server.services.gemini_service import GeminiMealPlanner
from server.services.supabase_client import get_supabase_client

class MealPlanRecommendationService:
    """Main recommendation service orchestrating vector similarity and Gemini AI"""
    
    def __init__(self):
        self.vectorizer = NutritionVectorizer()
        self.recommender = CosineSimilarityRecommender()
        self.gemini = GeminiMealPlanner()
        self.supabase = get_supabase_client()
    
    async def generate_personalized_meal_plan(
        self,
        user_id: str,
        budget: float,
        calorie_target: float,
        dietary_preferences: List[str],
        health_goals: List[str],
        allergies: Optional[List[str]] = None,
        duration_days: int = 7,
        region: Optional[str] = None
    ) -> Dict:
        """
        Main workflow: User input → Vector → Similarity → Gemini prediction
        
        Args:
            user_id: User ID
            budget: Weekly budget in INR
            calorie_target: Daily calorie target
            dietary_preferences: List of dietary preferences
            health_goals: List of health goals
            allergies: Optional list of allergies
            duration_days: Number of days
            region: Optional region for pricing
            
        Returns:
            Complete meal plan with recommendations
        """
        # Step 1: Create user preference vector
        user_vector = self._create_user_vector(
            calorie_target,
            dietary_preferences,
            health_goals
        )
        
        # Step 2: Fetch all recipes from database
        recipes = await self._fetch_recipes(dietary_preferences, allergies)
        
        # Step 3: Create vectors for all recipes
        recipe_vectors = self._create_recipe_vectors(recipes)
        
        # Step 4: Find top similar recipes using cosine similarity
        similar_recipes = self.recommender.find_similar_recipes(
            user_vector,
            recipe_vectors,
            top_k=20  # Get top 20 for Gemini to choose from
        )
        
        # Step 5: Prepare recommended recipes data
        recommended_recipes = self._prepare_recommended_recipes(
            similar_recipes,
            recipes
        )
        
        # Step 6: Send to Gemini for final meal plan generation
        user_preferences = {
            'calorie_target': calorie_target,
            'dietary_preferences': dietary_preferences,
            'health_goals': health_goals,
            'allergies': allergies or [],
            'protein_ratio': 0.3,
            'carbs_ratio': 0.4,
            'fat_ratio': 0.3
        }
        
        meal_plan = self.gemini.generate_meal_plan(
            user_preferences=user_preferences,
            recommended_recipes=recommended_recipes,
            budget=budget,
            duration_days=duration_days
        )
        
        return meal_plan
    
    def _create_user_vector(
        self,
        calorie_target: float,
        dietary_preferences: List[str],
        health_goals: List[str]
    ) -> np.ndarray:
        """Create user preference vector from inputs"""
        # Adjust ratios based on health goals
        protein_ratio = 0.3
        carbs_ratio = 0.4
        fat_ratio = 0.3
        
        if "GAIN_MUSCLE" in health_goals:
            protein_ratio = 0.35
            carbs_ratio = 0.35
        elif "LOSE_WEIGHT" in health_goals:
            protein_ratio = 0.35
            carbs_ratio = 0.35
            fat_ratio = 0.30
        
        preferences = {
            'fiber_preference': 30.0 if "HIGH_FIBER" in dietary_preferences else 25.0
        }
        
        return self.vectorizer.create_user_preference_vector(
            calorie_target=calorie_target,
            protein_ratio=protein_ratio,
            carbs_ratio=carbs_ratio,
            fat_ratio=fat_ratio,
            preferences=preferences
        )
    
    async def _fetch_recipes(
        self,
        dietary_preferences: List[str],
        allergies: Optional[List[str]]
    ) -> List[Dict]:
        """Fetch recipes from Supabase with filters"""
        query = self.supabase.table("recipes").select("*")
        
        # Filter by dietary preferences
        if "VEGETARIAN" in dietary_preferences:
            query = query.not_.like("tags", "%non-vegetarian%")
        if "VEGAN" in dietary_preferences:
            query = query.not_.like("tags", "%dairy%").not_.like("tags", "%meat%")
        if "GLUTEN_FREE" in dietary_preferences:
            query = query.like("tags", "%gluten-free%")
        
        # Limit results
        response = query.limit(100).execute()
        recipes = response.data if response.data else []
        
        # Filter allergies in Python (more flexible)
        if allergies:
            filtered_recipes = []
            for recipe in recipes:
                recipe_tags = recipe.get('tags', [])
                if isinstance(recipe_tags, str):
                    recipe_tags = [recipe_tags]
                
                # Check if recipe contains allergens
                has_allergen = False
                for allergy in allergies:
                    allergy_lower = allergy.lower()
                    if any(allergy_lower in str(tag).lower() for tag in recipe_tags):
                        has_allergen = True
                        break
                
                if not has_allergen:
                    filtered_recipes.append(recipe)
            
            recipes = filtered_recipes
        
        return recipes
    
    def _create_recipe_vectors(
        self,
        recipes: List[Dict]
    ) -> List[tuple]:
        """Create nutrition vectors for all recipes"""
        recipe_vectors = []
        
        for recipe in recipes:
            # Get recipe ingredients with nutrition data
            ingredients_data = recipe.get('ingredients', [])
            
            if not ingredients_data:
                # Use recipe-level nutrition if available
                vector = self.vectorizer.create_ingredient_vector(
                    calories=recipe.get('calories', 0),
                    protein=recipe.get('protein', 0),
                    carbs=recipe.get('carbs', 0),
                    fat=recipe.get('fat', 0)
                )
            else:
                # Create vector from aggregated ingredients
                vector = self.vectorizer.create_recipe_vector(
                    ingredients=ingredients_data,
                    servings=recipe.get('servings', 1)
                )
            
            recipe_vectors.append((recipe['id'], vector))
        
        return recipe_vectors
    
    def _prepare_recommended_recipes(
        self,
        similar_recipes: List[tuple],
        all_recipes: List[Dict]
    ) -> List[Dict]:
        """Prepare recommended recipes data for Gemini"""
        recipe_dict = {r['id']: r for r in all_recipes}
        recommended = []
        
        for recipe_id, similarity_score in similar_recipes:
            if recipe_id in recipe_dict:
                recipe = recipe_dict[recipe_id].copy()
                recipe['similarity_score'] = similarity_score
                recommended.append(recipe)
        
        return recommended

