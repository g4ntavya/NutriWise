"""
User Onboarding Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from server.services.user_onboarding import UserProfile, OnboardingService
from server.services.meal_planning_pipeline import MealPlanningPipeline
from server.middleware.auth import get_current_user

router = APIRouter()

class OnboardingRequest(BaseModel):
    age: int
    gender: str
    weight_kg: float
    height_cm: float
    activity_level: str
    dietary_goal: str
    target_weight_kg: Optional[float] = None
    timeline_weeks: Optional[int] = None
    dietary_preferences: List[str] = []
    allergies: List[str] = []
    intolerances: List[str] = []
    preferred_cuisines: List[str] = []
    disliked_foods: List[str] = []
    custom_calorie_target: Optional[float] = None
    custom_protein_ratio: Optional[float] = None
    custom_carbs_ratio: Optional[float] = None
    custom_fat_ratio: Optional[float] = None
    weekly_budget_inr: Optional[float] = None
    region: Optional[str] = None

@router.post("/complete")
async def complete_onboarding(
    request: OnboardingRequest,
    user: dict = Depends(get_current_user)
):
    """Complete user onboarding and create profile"""
    pipeline = MealPlanningPipeline()
    
    try:
        profile_data = request.dict()
        profile_data["email"] = user.get("email")
        profile_data["name"] = user.get("user_metadata", {}).get("name")
        
        complete_profile = await pipeline.process_user_onboarding(
            profile_data,
            user["id"]
        )
        
        return complete_profile
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """Get user profile"""
    pipeline = MealPlanningPipeline()
    supabase = pipeline.supabase
    
    try:
        response = supabase.table("users").select("*").eq("id", user["id"]).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/natural-language")
async def parse_natural_language(
    message: str,
    user: dict = Depends(get_current_user)
):
    """Parse natural language request using LLM"""
    pipeline = MealPlanningPipeline()
    
    try:
        parsed = await pipeline.parse_natural_language_request(message, user["id"])
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

