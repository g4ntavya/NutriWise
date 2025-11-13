"""
Nutrition Validation Service
Validates nutrition constraints and calculates nutritional values
DETERMINISTIC CODE - strict nutrition logic
"""
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class NutritionValues:
    """Nutrition values for validation"""
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: Optional[float] = None
    calcium_mg: Optional[float] = None
    iron_mg: Optional[float] = None
    vitamin_c_mg: Optional[float] = None

class NutritionValidator:
    """
    Validates nutrition against constraints
    All validation is DETERMINISTIC - no LLM
    """
    
    @staticmethod
    def calculate_recipe_nutrition(
        ingredients: List[Dict],
        servings: float = 1.0
    ) -> NutritionValues:
        """
        Calculate total nutrition for a recipe from ingredients
        DETERMINISTIC CALCULATION
        """
        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fat = 0.0
        total_fiber = 0.0
        total_calcium = 0.0
        total_iron = 0.0
        total_vitamin_c = 0.0
        
        for ingredient in ingredients:
            quantity_g = float(ingredient.get("quantity_g", 0))
            
            # Get nutrition per 100g
            nutrition = ingredient.get("nutrition_per_100g", {})
            
            # Calculate for actual quantity
            factor = quantity_g / 100.0
            
            total_calories += float(nutrition.get("calories", 0)) * factor
            total_protein += float(nutrition.get("protein_g", 0)) * factor
            total_carbs += float(nutrition.get("carbs_g", 0)) * factor
            total_fat += float(nutrition.get("fat_g", 0)) * factor
            total_fiber += float(nutrition.get("fiber_g", 0)) * factor if nutrition.get("fiber_g") else 0
            total_calcium += float(nutrition.get("calcium_mg", 0)) * factor if nutrition.get("calcium_mg") else 0
            total_iron += float(nutrition.get("iron_mg", 0)) * factor if nutrition.get("iron_mg") else 0
            total_vitamin_c += float(nutrition.get("vitamin_c_mg", 0)) * factor if nutrition.get("vitamin_c_mg") else 0
        
        # Per serving
        return NutritionValues(
            calories=round(total_calories / servings, 2),
            protein_g=round(total_protein / servings, 2),
            carbs_g=round(total_carbs / servings, 2),
            fat_g=round(total_fat / servings, 2),
            fiber_g=round(total_fiber / servings, 2) if total_fiber > 0 else None,
            calcium_mg=round(total_calcium / servings, 2) if total_calcium > 0 else None,
            iron_mg=round(total_iron / servings, 2) if total_iron > 0 else None,
            vitamin_c_mg=round(total_vitamin_c / servings, 2) if total_vitamin_c > 0 else None
        )
    
    @staticmethod
    def calculate_daily_nutrition(meals: List[Dict]) -> NutritionValues:
        """
        Calculate total daily nutrition from all meals
        DETERMINISTIC CALCULATION
        """
        total = NutritionValues(calories=0, protein_g=0, carbs_g=0, fat_g=0)
        
        for meal in meals:
            nutrition = meal.get("nutrition", {})
            total.calories += float(nutrition.get("calories", 0))
            total.protein_g += float(nutrition.get("protein_g", 0))
            total.carbs_g += float(nutrition.get("carbs_g", 0))
            total.fat_g += float(nutrition.get("fat_g", 0))
        
        return NutritionValues(
            calories=round(total.calories, 2),
            protein_g=round(total.protein_g, 2),
            carbs_g=round(total.carbs_g, 2),
            fat_g=round(total.fat_g, 2)
        )
    
    @staticmethod
    def validate_against_constraints(
        actual: NutritionValues,
        constraints: Dict,
        tolerance: float = 0.1
    ) -> Dict[str, any]:
        """
        Validate nutrition against user constraints
        DETERMINISTIC VALIDATION
        """
        target_calories = constraints.get("daily_calories", 0)
        target_protein = constraints.get("daily_protein_g", 0)
        target_carbs = constraints.get("daily_carbs_g", 0)
        target_fat = constraints.get("daily_fat_g", 0)
        
        results = {
            "calories": {
                "target": target_calories,
                "actual": actual.calories,
                "difference": round(actual.calories - target_calories, 2),
                "within_tolerance": abs(actual.calories - target_calories) <= target_calories * tolerance,
                "percentage": round((actual.calories / target_calories) * 100, 2) if target_calories > 0 else 0
            },
            "protein": {
                "target": target_protein,
                "actual": actual.protein_g,
                "difference": round(actual.protein_g - target_protein, 2),
                "within_tolerance": abs(actual.protein_g - target_protein) <= target_protein * tolerance,
                "percentage": round((actual.protein_g / target_protein) * 100, 2) if target_protein > 0 else 0
            },
            "carbs": {
                "target": target_carbs,
                "actual": actual.carbs_g,
                "difference": round(actual.carbs_g - target_carbs, 2),
                "within_tolerance": abs(actual.carbs_g - target_carbs) <= target_carbs * tolerance,
                "percentage": round((actual.carbs_g / target_carbs) * 100, 2) if target_carbs > 0 else 0
            },
            "fat": {
                "target": target_fat,
                "actual": actual.fat_g,
                "difference": round(actual.fat_g - target_fat, 2),
                "within_tolerance": abs(actual.fat_g - target_fat) <= target_fat * tolerance,
                "percentage": round((actual.fat_g / target_fat) * 100, 2) if target_fat > 0 else 0
            }
        }
        
        # Overall validation
        all_valid = all([
            results["calories"]["within_tolerance"],
            results["protein"]["within_tolerance"],
            results["carbs"]["within_tolerance"],
            results["fat"]["within_tolerance"]
        ])
        
        results["overall_valid"] = all_valid
        results["tolerance"] = tolerance
        
        return results
    
    @staticmethod
    def check_allergy_compliance(
        ingredients: List[str],
        allergies: List[str],
        intolerances: List[str]
    ) -> Dict[str, any]:
        """
        Check if ingredients comply with allergies/intolerances
        DETERMINISTIC VALIDATION
        """
        violations = []
        safe_ingredients = []
        
        all_restrictions = [a.lower() for a in allergies + intolerances]
        
        for ingredient in ingredients:
            ingredient_lower = ingredient.lower()
            is_violation = False
            
            for restriction in all_restrictions:
                if restriction in ingredient_lower or ingredient_lower in restriction:
                    violations.append({
                        "ingredient": ingredient,
                        "violates": restriction
                    })
                    is_violation = True
                    break
            
            if not is_violation:
                safe_ingredients.append(ingredient)
        
        return {
            "compliant": len(violations) == 0,
            "violations": violations,
            "safe_ingredients": safe_ingredients,
            "total_ingredients": len(ingredients),
            "violation_count": len(violations)
        }
    
    @staticmethod
    def check_dietary_preference_compliance(
        ingredients: List[str],
        recipe_tags: List[str],
        dietary_preferences: List[str]
    ) -> Dict[str, any]:
        """
        Check if recipe complies with dietary preferences
        DETERMINISTIC VALIDATION
        """
        violations = []
        compliance_checks = {}
        
        preference_map = {
            "VEGETARIAN": ["meat", "chicken", "fish", "pork", "beef", "lamb"],
            "VEGAN": ["meat", "chicken", "fish", "pork", "beef", "lamb", "dairy", "milk", "cheese", "butter", "egg", "eggs"],
            "PESCATARIAN": ["meat", "chicken", "pork", "beef", "lamb"],
            "GLUTEN_FREE": ["wheat", "gluten", "barley", "rye"],
            "DAIRY_FREE": ["dairy", "milk", "cheese", "butter", "cream"]
        }
        
        for preference in dietary_preferences:
            restricted_items = preference_map.get(preference, [])
            is_compliant = True
            found_violations = []
            
            for ingredient in ingredients:
                ingredient_lower = ingredient.lower()
                for restricted in restricted_items:
                    if restricted in ingredient_lower:
                        is_compliant = False
                        found_violations.append({
                            "ingredient": ingredient,
                            "restriction": preference
                        })
            
            compliance_checks[preference] = {
                "compliant": is_compliant,
                "violations": found_violations
            }
            
            if not is_compliant:
                violations.extend(found_violations)
        
        return {
            "overall_compliant": len(violations) == 0,
            "compliance_checks": compliance_checks,
            "violations": violations
        }

