"""
Pricing Analysis Service
Analyzes pricing data from database files and calculates meal costs
DETERMINISTIC CODE - strict pricing logic
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import os

class PricingAnalyzer:
    """
    Analyzes ingredient pricing from database files
    All pricing calculations are DETERMINISTIC - no LLM
    """
    
    def __init__(self, dataset_path: str = "dataset"):
        self.dataset_path = Path(dataset_path)
        self.ingredient_prices: Dict[str, Dict] = {}
        self.regional_prices: Dict[str, Dict[str, float]] = {}
        self._load_pricing_data()
    
    def _load_pricing_data(self):
        """Load pricing data from CSV files"""
        csv_file = self.dataset_path / "Indian_Global_Foods_Nutrition_Prices_100items.csv"
        
        if not csv_file.exists():
            print(f"Warning: Pricing CSV not found at {csv_file}")
            return
        
        try:
            df = pd.read_csv(csv_file)
            
            for _, row in df.iterrows():
                item_name = str(row.get("Item", "")).strip()
                if not item_name or item_name == "nan":
                    continue
                
                price_per_kg = float(row.get("Price_INR_per_kg", 0))
                price_per_100g = price_per_kg / 10
                
                self.ingredient_prices[item_name.lower()] = {
                    "name": item_name,
                    "price_per_kg": price_per_kg,
                    "price_per_100g": price_per_100g,
                    "price_per_unit": price_per_100g,  # Default unit is 100g
                    "unit": "100g"
                }
            
            print(f"✅ Loaded pricing for {len(self.ingredient_prices)} ingredients")
        except Exception as e:
            print(f"Error loading pricing data: {e}")
    
    def get_ingredient_price(
        self,
        ingredient_name: str,
        quantity_g: float = 100,
        region: Optional[str] = None
    ) -> float:
        """
        Get price for ingredient
        DETERMINISTIC CALCULATION
        """
        name_lower = ingredient_name.lower()
        
        # Try exact match
        if name_lower in self.ingredient_prices:
            price_per_100g = self.ingredient_prices[name_lower]["price_per_100g"]
            return (price_per_100g / 100) * quantity_g
        
        # Try partial match
        for key, data in self.ingredient_prices.items():
            if key in name_lower or name_lower in key:
                price_per_100g = data["price_per_100g"]
                return (price_per_100g / 100) * quantity_g
        
        # Default price if not found (estimate based on category)
        return self._estimate_price(ingredient_name, quantity_g)
    
    def _estimate_price(self, ingredient_name: str, quantity_g: float) -> float:
        """Estimate price for unknown ingredients"""
        name_lower = ingredient_name.lower()
        
        # Category-based estimates (per 100g)
        category_estimates = {
            "vegetable": 30,  # ₹30 per 100g
            "fruit": 50,
            "grain": 10,
            "pulse": 12,
            "protein": 200,  # meat/fish
            "dairy": 60,
            "spice": 100,
            "oil": 150
        }
        
        for category, price_per_100g in category_estimates.items():
            if category in name_lower:
                return (price_per_100g / 100) * quantity_g
        
        # Default estimate
        return (50 / 100) * quantity_g  # ₹50 per 100g default
    
    def calculate_recipe_cost(
        self,
        ingredients: List[Dict],
        servings: float = 1.0,
        region: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Calculate total cost for a recipe
        DETERMINISTIC CALCULATION
        
        Args:
            ingredients: List of {name, quantity_g}
            servings: Number of servings
            region: Optional region for pricing
            
        Returns:
            {total_cost, cost_per_serving, ingredient_costs}
        """
        total_cost = 0.0
        ingredient_costs = []
        
        for ingredient in ingredients:
            name = ingredient.get("name", "")
            quantity_g = float(ingredient.get("quantity_g", 0))
            
            cost = self.get_ingredient_price(name, quantity_g, region)
            total_cost += cost
            
            ingredient_costs.append({
                "name": name,
                "quantity_g": quantity_g,
                "cost": round(cost, 2)
            })
        
        cost_per_serving = total_cost / servings if servings > 0 else total_cost
        
        return {
            "total_cost": round(total_cost, 2),
            "cost_per_serving": round(cost_per_serving, 2),
            "servings": servings,
            "ingredient_costs": ingredient_costs
        }
    
    def calculate_meal_plan_cost(
        self,
        meal_plan: Dict,
        region: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Calculate total cost for entire meal plan
        DETERMINISTIC CALCULATION
        """
        total_cost = 0.0
        daily_costs = []
        
        for day in meal_plan.get("days", []):
            day_cost = 0.0
            
            for meal in day.get("meals", []):
                ingredients = meal.get("ingredients", [])
                servings = meal.get("servings", 1.0)
                
                recipe_cost = self.calculate_recipe_cost(ingredients, servings, region)
                meal_cost = recipe_cost["total_cost"]
                day_cost += meal_cost
                
                meal["calculated_cost"] = meal_cost
            
            total_cost += day_cost
            daily_costs.append({
                "day_index": day.get("dayIndex", 0),
                "cost": round(day_cost, 2)
            })
        
        avg_daily_cost = total_cost / len(daily_costs) if daily_costs else 0
        
        return {
            "total_cost": round(total_cost, 2),
            "average_daily_cost": round(avg_daily_cost, 2),
            "daily_costs": daily_costs,
            "budget_compliance": {
                "within_budget": True,  # Will be validated separately
                "budget_utilization": 0.0  # Will be calculated
            }
        }
    
    def validate_budget(
        self,
        meal_plan_cost: float,
        budget: float,
        tolerance: float = 0.1
    ) -> Dict[str, any]:
        """
        Validate if meal plan fits within budget
        DETERMINISTIC VALIDATION
        """
        within_budget = meal_plan_cost <= budget * (1 + tolerance)
        utilization = (meal_plan_cost / budget) * 100 if budget > 0 else 0
        difference = meal_plan_cost - budget
        
        return {
            "within_budget": within_budget,
            "budget_utilization_percent": round(utilization, 2),
            "cost_difference": round(difference, 2),
            "budget": budget,
            "actual_cost": meal_plan_cost,
            "tolerance": tolerance
        }
    
    def suggest_budget_range(
        self,
        calorie_target: float,
        dietary_preferences: List[str]
    ) -> Dict[str, float]:
        """
        Suggest budget range based on calorie target and preferences
        DETERMINISTIC CALCULATION
        """
        # Base cost per 100 calories
        base_cost_per_100cal = 15  # ₹15 per 100 calories
        
        # Adjustments for dietary preferences
        adjustments = {
            "VEGAN": 0.9,  # Slightly cheaper
            "VEGETARIAN": 0.95,
            "NON_VEGETARIAN": 1.1,  # More expensive
            "KETO": 1.2,  # Higher fat = more expensive
            "ORGANIC": 1.5  # Organic foods cost more
        }
        
        multiplier = 1.0
        for pref in dietary_preferences:
            multiplier *= adjustments.get(pref, 1.0)
        
        estimated_daily = (calorie_target / 100) * base_cost_per_100cal * multiplier
        estimated_weekly = estimated_daily * 7
        
        return {
            "suggested_daily_budget": round(estimated_daily, 2),
            "suggested_weekly_budget": round(estimated_weekly, 2),
            "min_budget": round(estimated_weekly * 0.7, 2),  # 30% lower
            "max_budget": round(estimated_weekly * 1.5, 2)  # 50% higher
        }

