"""
LLM Interaction Service
Handles all LLM (Gemini) interactions for user requests
LLM TASKS: Understanding, generating, recommending
"""
import google.generativeai as genai
import os
import json
from typing import Dict, List, Optional, Any
from server.services.user_onboarding import UserProfile, DietaryGoal, DietaryPreference

class LLMInteractionService:
    """
    Service for LLM interactions
    LLM handles: Natural language understanding, recipe generation, recommendations
    """
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY must be set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name=os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        )
    
    def parse_user_request(
        self,
        user_message: str,
        current_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        LLM TASK: Parse natural language user request into structured data
        
        Examples:
        - "I want to lose 5kg in 2 months"
        - "Create a vegetarian meal plan for 2000 calories"
        - "I'm allergic to nuts and want high protein meals"
        """
        prompt = f"""You are a nutrition assistant. Parse the user's request into structured data.

User Message: "{user_message}"

Current Profile: {json.dumps(current_profile, indent=2) if current_profile else "None"}

Extract the following information from the user's message:
1. Dietary goal (lose_weight, maintain_weight, gain_weight, build_muscle, improve_energy)
2. Calorie target (if mentioned)
3. Dietary preferences (vegetarian, vegan, etc.)
4. Allergies/intolerances
5. Preferred cuisines
6. Budget (if mentioned)
7. Timeline (if mentioned)
8. Any specific requirements

Return ONLY valid JSON with this structure:
{{
    "dietary_goal": "lose_weight" | "maintain_weight" | "gain_weight" | "build_muscle" | "improve_energy" | null,
    "calorie_target": number | null,
    "dietary_preferences": ["vegetarian", "vegan", etc.] | [],
    "allergies": ["nuts", "dairy", etc.] | [],
    "intolerances": ["lactose", "gluten", etc.] | [],
    "preferred_cuisines": ["indian", "italian", etc.] | [],
    "budget_weekly_inr": number | null,
    "timeline_weeks": number | null,
    "specific_requirements": "any specific text requirements" | null,
    "confidence": 0.0-1.0
}}

Return ONLY JSON, no markdown formatting."""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            parsed = json.loads(response_text)
            return parsed
        except Exception as e:
            print(f"LLM parsing error: {e}")
            return {
                "dietary_goal": None,
                "calorie_target": None,
                "dietary_preferences": [],
                "allergies": [],
                "intolerances": [],
                "preferred_cuisines": [],
                "budget_weekly_inr": None,
                "timeline_weeks": None,
                "specific_requirements": None,
                "confidence": 0.0
            }
    
    def generate_recipe_suggestions(
        self,
        nutrition_constraints: Dict,
        dietary_preferences: List[str],
        preferred_cuisines: List[str],
        num_suggestions: int = 10
    ) -> List[Dict]:
        """
        LLM TASK: Generate recipe suggestions based on constraints
        
        LLM creates creative recipe ideas, deterministic code validates nutrition
        """
        prompt = f"""You are a creative chef and nutritionist. Generate {num_suggestions} recipe suggestions.

Nutrition Constraints:
- Calories per meal: {nutrition_constraints.get('daily_calories', 2000) / 3:.0f}
- Protein: {nutrition_constraints.get('daily_protein_g', 150) / 3:.0f}g per meal
- Carbs: {nutrition_constraints.get('daily_carbs_g', 200) / 3:.0f}g per meal
- Fat: {nutrition_constraints.get('daily_fat_g', 67) / 3:.0f}g per meal

Dietary Preferences: {', '.join(dietary_preferences)}
Preferred Cuisines: {', '.join(preferred_cuisines) if preferred_cuisines else 'Any'}

Generate creative, delicious recipe suggestions. For each recipe, provide:
- Name
- Brief description
- Main ingredients (list)
- Cuisine type
- Meal type (breakfast, lunch, dinner, snack)
- Estimated prep time
- Why it fits the constraints

Return JSON array:
[
    {{
        "name": "Recipe Name",
        "description": "Brief description",
        "main_ingredients": ["ingredient1", "ingredient2"],
        "cuisine": "indian",
        "meal_type": "lunch",
        "prep_time_minutes": 30,
        "reasoning": "Why this fits"
    }}
]

Return ONLY JSON array, no markdown."""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            suggestions = json.loads(response_text)
            return suggestions if isinstance(suggestions, list) else []
        except Exception as e:
            print(f"LLM recipe generation error: {e}")
            return []
    
    def generate_meal_plan_from_recommendations(
        self,
        user_profile: Dict,
        nutrition_constraints: Dict,
        recommended_recipes: List[Dict],
        budget_constraints: Dict,
        duration_days: int = 7
    ) -> Dict:
        """
        LLM TASK: Generate complete meal plan from recommendations
        
        LLM creates the meal plan structure, deterministic code validates it
        """
        prompt = f"""You are an expert meal planner. Create a {duration_days}-day meal plan.

User Profile:
- Goal: {user_profile.get('dietary_goal', 'maintain_weight')}
- Preferences: {', '.join(user_profile.get('dietary_preferences', []))}
- Allergies: {', '.join(user_profile.get('allergies', []))}

Nutrition Targets (per day):
- Calories: {nutrition_constraints.get('daily_calories', 2000):.0f}
- Protein: {nutrition_constraints.get('daily_protein_g', 150):.0f}g
- Carbs: {nutrition_constraints.get('daily_carbs_g', 200):.0f}g
- Fat: {nutrition_constraints.get('daily_fat_g', 67):.0f}g

Budget: ₹{budget_constraints.get('weekly_budget_inr', 2500):.0f} per week (₹{budget_constraints.get('daily_budget_inr', 357):.0f} per day)

Recommended Recipes (use these when possible):
{json.dumps(recommended_recipes[:20], indent=2)}

Create a {duration_days}-day meal plan with:
- Variety across days
- Balanced nutrition per day
- Budget compliance
- Allergy compliance
- Preference compliance

Return JSON:
{{
    "days": [
        {{
            "dayIndex": 0,
            "meals": [
                {{
                    "name": "Meal name",
                    "mealType": "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
                    "recipeId": "recipe-id-if-using-recommended",
                    "recipeName": "Recipe name",
                    "ingredients": ["ingredient1", "ingredient2"],
                    "estimatedCalories": 400,
                    "estimatedCost": 150,
                    "estimatedNutrition": {{
                        "protein_g": 25,
                        "carbs_g": 45,
                        "fat_g": 12
                    }}
                }}
            ],
            "totalCalories": 2000,
            "totalCost": 350
        }}
    ],
    "totalCost": 2450,
    "averageDailyCalories": 2000
}}

Return ONLY JSON, no markdown."""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            meal_plan = json.loads(response_text)
            return meal_plan
        except Exception as e:
            print(f"LLM meal plan generation error: {e}")
            raise
    
    def provide_nutrition_advice(
        self,
        user_profile: Dict,
        question: str
    ) -> str:
        """
        LLM TASK: Provide nutrition advice and answer questions
        
        Pure LLM task - no deterministic validation needed
        """
        prompt = f"""You are a certified nutrition coach. Answer the user's question.

User Profile:
{json.dumps(user_profile, indent=2)}

User Question: "{question}"

Provide helpful, accurate nutrition advice based on the user's profile. Be specific and actionable."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"I apologize, but I encountered an error: {str(e)}"

