"""
User Onboarding Service
Collects and validates user profile data for meal planning
"""
from typing import Optional, Dict, List
from pydantic import BaseModel, Field, validator
from enum import Enum
import math

class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class ActivityLevel(str, Enum):
    SEDENTARY = "SEDENTARY"  # Little/no exercise
    LIGHTLY_ACTIVE = "LIGHTLY_ACTIVE"  # Light exercise 1-3 days/week
    MODERATELY_ACTIVE = "MODERATELY_ACTIVE"  # Moderate exercise 3-5 days/week
    VERY_ACTIVE = "VERY_ACTIVE"  # Hard exercise 6-7 days/week
    EXTRA_ACTIVE = "EXTRA_ACTIVE"  # Very hard exercise, physical job

class DietaryGoal(str, Enum):
    LOSE_WEIGHT = "LOSE_WEIGHT"
    MAINTAIN_WEIGHT = "MAINTAIN_WEIGHT"
    GAIN_WEIGHT = "GAIN_WEIGHT"
    BUILD_MUSCLE = "BUILD_MUSCLE"
    IMPROVE_ENERGY = "IMPROVE_ENERGY"

class DietaryPreference(str, Enum):
    VEGETARIAN = "VEGETARIAN"
    VEGAN = "VEGAN"
    NON_VEGETARIAN = "NON_VEGETARIAN"
    PESCATARIAN = "PESCATARIAN"
    GLUTEN_FREE = "GLUTEN_FREE"
    DAIRY_FREE = "DAIRY_FREE"
    KETO = "KETO"
    PALEO = "PALEO"
    LOW_CARB = "LOW_CARB"
    HIGH_PROTEIN = "HIGH_PROTEIN"

class UserProfile(BaseModel):
    """Complete user profile for meal planning"""
    # Basic Demographics
    age: int = Field(..., ge=13, le=120, description="User age in years")
    gender: Gender
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")
    height_cm: float = Field(..., gt=0, description="Height in centimeters")
    
    # Activity & Goals
    activity_level: ActivityLevel
    dietary_goal: DietaryGoal
    target_weight_kg: Optional[float] = Field(None, gt=0, description="Target weight if applicable")
    timeline_weeks: Optional[int] = Field(None, ge=1, description="Timeline to reach goal in weeks")
    
    # Dietary Preferences
    dietary_preferences: List[DietaryPreference] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list, description="List of allergies/intolerances")
    intolerances: List[str] = Field(default_factory=list, description="List of food intolerances")
    preferred_cuisines: List[str] = Field(default_factory=list, description="Preferred cuisine types")
    disliked_foods: List[str] = Field(default_factory=list, description="Foods user dislikes")
    
    # Custom Targets (optional - will be calculated if not provided)
    custom_calorie_target: Optional[float] = Field(None, gt=0)
    custom_protein_ratio: Optional[float] = Field(None, ge=0, le=1)
    custom_carbs_ratio: Optional[float] = Field(None, ge=0, le=1)
    custom_fat_ratio: Optional[float] = Field(None, ge=0, le=1)
    
    # Budget
    weekly_budget_inr: Optional[float] = Field(None, gt=0, description="Weekly food budget in INR")
    region: Optional[str] = Field(None, description="Region for pricing")
    
    @validator('custom_protein_ratio', 'custom_carbs_ratio', 'custom_fat_ratio')
    def validate_macro_ratios(cls, v, values):
        """Ensure macro ratios sum to 1 if all provided"""
        if v is not None:
            protein = values.get('custom_protein_ratio', 0) or 0
            carbs = values.get('custom_carbs_ratio', 0) or 0
            fat = values.get('custom_fat_ratio', 0) or 0
            total = protein + carbs + fat
            if total > 1.01:  # Allow small floating point errors
                raise ValueError("Macro ratios must sum to 1.0 or less")
        return v

class OnboardingService:
    """Service for user onboarding and profile management"""
    
    @staticmethod
    def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: Gender) -> float:
        """
        Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
        This is DETERMINISTIC CODE - no LLM involved
        """
        if gender == Gender.MALE:
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        else:  # FEMALE or OTHER
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        
        return round(bmr, 2)
    
    @staticmethod
    def calculate_tdee(bmr: float, activity_level: ActivityLevel) -> float:
        """
        Calculate Total Daily Energy Expenditure (TDEE)
        DETERMINISTIC CODE
        """
        activity_multipliers = {
            ActivityLevel.SEDENTARY: 1.2,
            ActivityLevel.LIGHTLY_ACTIVE: 1.375,
            ActivityLevel.MODERATELY_ACTIVE: 1.55,
            ActivityLevel.VERY_ACTIVE: 1.725,
            ActivityLevel.EXTRA_ACTIVE: 1.9
        }
        
        tdee = bmr * activity_multipliers[activity_level]
        return round(tdee, 2)
    
    @staticmethod
    def calculate_calorie_target(
        profile: UserProfile,
        bmr: Optional[float] = None,
        tdee: Optional[float] = None
    ) -> float:
        """
        Calculate daily calorie target based on goal
        DETERMINISTIC CODE - strict logic
        """
        if profile.custom_calorie_target:
            return profile.custom_calorie_target
        
        if not bmr:
            bmr = OnboardingService.calculate_bmr(
                profile.weight_kg,
                profile.height_cm,
                profile.age,
                profile.gender
            )
        
        if not tdee:
            tdee = OnboardingService.calculate_tdee(bmr, profile.activity_level)
        
        # Adjust based on goal
        goal_adjustments = {
            DietaryGoal.LOSE_WEIGHT: -500,  # 500 cal deficit for ~0.5kg/week
            DietaryGoal.MAINTAIN_WEIGHT: 0,
            DietaryGoal.GAIN_WEIGHT: 500,  # 500 cal surplus
            DietaryGoal.BUILD_MUSCLE: 300,  # Moderate surplus for muscle gain
            DietaryGoal.IMPROVE_ENERGY: 0  # Maintain but optimize macros
        }
        
        base_calories = tdee + goal_adjustments.get(profile.dietary_goal, 0)
        
        # Adjust for timeline if provided
        if profile.target_weight_kg and profile.timeline_weeks:
            weight_diff = profile.target_weight_kg - profile.weight_kg
            weekly_change_kg = weight_diff / profile.timeline_weeks
            
            # 1kg fat = ~7700 calories
            # Weekly deficit/surplus needed
            weekly_calorie_adjustment = weekly_change_kg * 7700
            daily_adjustment = weekly_calorie_adjustment / 7
            
            base_calories += daily_adjustment
        
        # Safety limits
        min_calories = 1200 if profile.gender == Gender.FEMALE else 1500
        max_calories = 4000
        
        target = max(min_calories, min(base_calories, max_calories))
        return round(target, 2)
    
    @staticmethod
    def calculate_macro_targets(
        profile: UserProfile,
        calorie_target: float
    ) -> Dict[str, float]:
        """
        Calculate macro targets (protein, carbs, fat) in grams
        DETERMINISTIC CODE
        """
        # Default ratios based on goal
        if profile.custom_protein_ratio and profile.custom_carbs_ratio and profile.custom_fat_ratio:
            protein_ratio = profile.custom_protein_ratio
            carbs_ratio = profile.custom_carbs_ratio
            fat_ratio = profile.custom_fat_ratio
        else:
            # Goal-based default ratios
            if profile.dietary_goal == DietaryGoal.BUILD_MUSCLE:
                protein_ratio = 0.35
                carbs_ratio = 0.35
                fat_ratio = 0.30
            elif profile.dietary_goal == DietaryGoal.LOSE_WEIGHT:
                protein_ratio = 0.35
                carbs_ratio = 0.35
                fat_ratio = 0.30
            elif DietaryPreference.KETO in profile.dietary_preferences:
                protein_ratio = 0.25
                carbs_ratio = 0.05
                fat_ratio = 0.70
            elif DietaryPreference.LOW_CARB in profile.dietary_preferences:
                protein_ratio = 0.30
                carbs_ratio = 0.20
                fat_ratio = 0.50
            elif DietaryPreference.HIGH_PROTEIN in profile.dietary_preferences:
                protein_ratio = 0.40
                carbs_ratio = 0.30
                fat_ratio = 0.30
            else:
                # Balanced
                protein_ratio = 0.30
                carbs_ratio = 0.40
                fat_ratio = 0.30
        
        # Calculate grams (protein/carbs = 4 cal/g, fat = 9 cal/g)
        protein_g = (calorie_target * protein_ratio) / 4
        carbs_g = (calorie_target * carbs_ratio) / 4
        fat_g = (calorie_target * fat_ratio) / 9
        
        return {
            "calories": round(calorie_target, 2),
            "protein_g": round(protein_g, 2),
            "carbs_g": round(carbs_g, 2),
            "fat_g": round(fat_g, 2),
            "protein_ratio": protein_ratio,
            "carbs_ratio": carbs_ratio,
            "fat_ratio": fat_ratio
        }
    
    @staticmethod
    def calculate_bmi(weight_kg: float, height_cm: float) -> Dict[str, float]:
        """
        Calculate BMI and category
        DETERMINISTIC CODE
        """
        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)
        
        if bmi < 18.5:
            category = "UNDERWEIGHT"
        elif bmi < 25:
            category = "NORMAL"
        elif bmi < 30:
            category = "OVERWEIGHT"
        else:
            category = "OBESE"
        
        return {
            "bmi": round(bmi, 2),
            "category": category
        }
    
    def create_complete_profile(self, profile: UserProfile) -> Dict:
        """
        Create complete user profile with all calculated metrics
        Combines user input with deterministic calculations
        """
        bmr = self.calculate_bmr(
            profile.weight_kg,
            profile.height_cm,
            profile.age,
            profile.gender
        )
        
        tdee = self.calculate_tdee(bmr, profile.activity_level)
        calorie_target = self.calculate_calorie_target(profile, bmr, tdee)
        macro_targets = self.calculate_macro_targets(profile, calorie_target)
        bmi_data = self.calculate_bmi(profile.weight_kg, profile.height_cm)
        
        return {
            "profile": profile.dict(),
            "calculated_metrics": {
                "bmr": bmr,
                "tdee": tdee,
                "calorie_target": calorie_target,
                "macro_targets": macro_targets,
                "bmi": bmi_data
            },
            "nutrition_constraints": {
                "daily_calories": calorie_target,
                "daily_protein_g": macro_targets["protein_g"],
                "daily_carbs_g": macro_targets["carbs_g"],
                "daily_fat_g": macro_targets["fat_g"],
                "dietary_restrictions": profile.dietary_preferences,
                "allergies": profile.allergies,
                "intolerances": profile.intolerances,
                "preferred_cuisines": profile.preferred_cuisines,
                "disliked_foods": profile.disliked_foods
            },
            "budget_constraints": {
                "weekly_budget_inr": profile.weekly_budget_inr,
                "daily_budget_inr": profile.weekly_budget_inr / 7 if profile.weekly_budget_inr else None,
                "region": profile.region
            }
        }

