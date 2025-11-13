"""
Meal plan routes with vector-based recommendations and Gemini AI
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from server.services.recommendation_service import MealPlanRecommendationService
from server.services.supabase_client import get_supabase_client
from server.middleware.auth import get_current_user, optional_auth

router = APIRouter()

class CreateMealPlanRequest(BaseModel):
    budget: float
    calorie_target: float
    dietary_preferences: List[str]
    health_goals: List[str]
    allergies: Optional[List[str]] = None
    duration_days: int = 7
    region: Optional[str] = None

@router.post("")
async def create_meal_plan(
    request: CreateMealPlanRequest,
    user: dict = Depends(get_current_user)
):
    """Create meal plan using vector similarity + Gemini AI"""
    service = MealPlanRecommendationService()
    
    try:
        # Generate meal plan using recommendation service
        meal_plan = await service.generate_personalized_meal_plan(
            user_id=user["id"],
            budget=request.budget,
            calorie_target=request.calorie_target,
            dietary_preferences=request.dietary_preferences,
            health_goals=request.health_goals,
            allergies=request.allergies,
            duration_days=request.duration_days,
            region=request.region
        )
        
        # Save to database
        supabase = get_supabase_client()
        meal_plan_data = {
            "user_id": user["id"],
            "title": f"Meal Plan - {request.duration_days} days",
            "calorie_target": request.calorie_target,
            "total_cost": meal_plan.get("totalCost", 0),
            "budget": request.budget,
            "duration_days": request.duration_days,
            "meal_plan_data": meal_plan  # Store full JSON
        }
        
        response = supabase.table("meal_plans").insert(meal_plan_data).execute()
        
        if response.data:
            meal_plan["id"] = response.data[0]["id"]
            return meal_plan
        
        return meal_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create meal plan: {str(e)}")

@router.get("")
async def list_meal_plans(user: dict = Depends(get_current_user)):
    """List user's meal plans"""
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("meal_plans").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{meal_plan_id}")
async def get_meal_plan(
    meal_plan_id: str,
    user: Optional[dict] = Depends(optional_auth)
):
    """Get meal plan details"""
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("meal_plans").select("*").eq("id", meal_plan_id)
        
        # If user is authenticated, verify ownership
        if user:
            query = query.eq("user_id", user["id"])
        
        response = query.execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Meal plan not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{meal_plan_id}/regenerate")
async def regenerate_meal_plan(
    meal_plan_id: str,
    request: CreateMealPlanRequest,
    user: dict = Depends(get_current_user)
):
    """Regenerate meal plan"""
    # Delete old plan
    supabase = get_supabase_client()
    supabase.table("meal_plans").delete().eq("id", meal_plan_id).eq("user_id", user["id"]).execute()
    
    # Create new one
    return await create_meal_plan(request, user)

@router.get("/{meal_plan_id}/grocery-list")
async def get_grocery_list(
    meal_plan_id: str,
    user: Optional[dict] = Depends(optional_auth)
):
    """Get grocery list for meal plan"""
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("meal_plans").select("*").eq("id", meal_plan_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Meal plan not found")
        
        meal_plan = response.data[0]
        meal_plan_data = meal_plan.get("meal_plan_data", {})
        
        # Extract ingredients from meal plan
        ingredients_map = {}
        for day in meal_plan_data.get("days", []):
            for meal in day.get("meals", []):
                for ingredient in meal.get("ingredients", []):
                    if ingredient not in ingredients_map:
                        ingredients_map[ingredient] = 0
                    ingredients_map[ingredient] += 1
        
        grocery_list = [
            {"ingredient": ing, "quantity": qty}
            for ing, qty in ingredients_map.items()
        ]
        
        return {
            "items": grocery_list,
            "total_items": len(grocery_list),
            "meal_plan_id": meal_plan_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

