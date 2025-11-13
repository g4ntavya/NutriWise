"""
Gemini AI service for meal plan generation
Uses Google's Gemini AI with vector-based recommendations
"""
import google.generativeai as genai
import os
from typing import List, Dict, Optional
import json

class GeminiMealPlanner:
    """Gemini AI service for generating personalized meal plans"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY must be set in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name=os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        )
    
    def generate_meal_plan(
        self,
        user_preferences: Dict,
        recommended_recipes: List[Dict],
        budget: float,
        duration_days: int = 7
    ) -> Dict:
        """
        Generate meal plan using Gemini AI with vector-based recommendations
        
        Args:
            user_preferences: User preferences (calories, diet, goals, etc.)
            recommended_recipes: Top recipes from cosine similarity
            budget: Weekly budget in INR
            duration_days: Number of days for meal plan
            
        Returns:
            Generated meal plan structure
        """
        # Build context from recommended recipes
        recipe_context = self._format_recipes_for_prompt(recommended_recipes)
        
        # Build user preferences context
        preferences_context = self._format_preferences_for_prompt(user_preferences)
        
        prompt = f"""You are a nutrition expert creating a personalized meal plan using AI-powered recommendations.

USER PREFERENCES:
{preferences_context}

RECOMMENDED RECIPES (based on nutrition similarity):
{recipe_context}

BUDGET: ₹{budget} per week (approximately ₹{budget/duration_days:.0f} per day)
DURATION: {duration_days} days

Generate a {duration_days}-day meal plan that:
1. Uses recipes from the recommended list when possible
2. Stays within the budget
3. Meets calorie targets ({user_preferences.get('calorie_target', 2000)} calories/day)
4. Respects dietary preferences: {', '.join(user_preferences.get('dietary_preferences', []))}
5. Aligns with health goals: {', '.join(user_preferences.get('health_goals', []))}
6. Avoids allergies: {', '.join(user_preferences.get('allergies', []))}

Return a JSON object with this structure:
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
          "nutrition": {{
            "protein": 25,
            "carbs": 45,
            "fat": 12
          }}
        }}
      ],
      "totalCalories": 2000,
      "totalCost": 350
    }}
  ],
  "totalCost": 2450,
  "averageDailyCalories": 2000,
  "nutritionSummary": {{
    "totalProtein": 150,
    "totalCarbs": 250,
    "totalFat": 80
  }}
}}

Return ONLY valid JSON, no markdown formatting."""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            meal_plan = json.loads(response_text)
            return meal_plan
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response: {response_text}")
            raise ValueError("Failed to parse Gemini response as JSON")
        except Exception as e:
            print(f"Gemini API error: {e}")
            raise
    
    def _format_recipes_for_prompt(self, recipes: List[Dict]) -> str:
        """Format recommended recipes for Gemini prompt"""
        if not recipes:
            return "No specific recipes recommended."
        
        formatted = []
        for i, recipe in enumerate(recipes[:20], 1):  # Limit to top 20
            formatted.append(
                f"{i}. {recipe.get('name', 'Unknown')} "
                f"(ID: {recipe.get('id', 'N/A')})\n"
                f"   Calories: {recipe.get('calories', 0)} per serving\n"
                f"   Nutrition: P:{recipe.get('protein', 0)}g, C:{recipe.get('carbs', 0)}g, F:{recipe.get('fat', 0)}g\n"
                f"   Cuisine: {recipe.get('cuisine', 'N/A')}\n"
                f"   Tags: {', '.join(recipe.get('tags', []))}"
            )
        
        return "\n".join(formatted)
    
    def _format_preferences_for_prompt(self, preferences: Dict) -> str:
        """Format user preferences for Gemini prompt"""
        return f"""Calorie Target: {preferences.get('calorie_target', 2000)} calories/day
Dietary Preferences: {', '.join(preferences.get('dietary_preferences', []))}
Health Goals: {', '.join(preferences.get('health_goals', []))}
Allergies: {', '.join(preferences.get('allergies', [])) if preferences.get('allergies') else 'None'}
Protein Ratio: {preferences.get('protein_ratio', 0.3) * 100:.0f}%
Carbs Ratio: {preferences.get('carbs_ratio', 0.4) * 100:.0f}%
Fat Ratio: {preferences.get('fat_ratio', 0.3) * 100:.0f}%"""

