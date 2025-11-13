"""
Meal plan routes with vector-based recommendations and Gemini AI
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from server.services.meal_planning_pipeline import MealPlanningPipeline
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
    user: dict = Depends(get_current_user),
    natural_language: Optional[str] = None
):
    """Create meal plan using complete pipeline (LLM + Deterministic Code)"""
    pipeline = MealPlanningPipeline()
    
    try:
        # Update user constraints if provided
        if request.budget or request.calorie_target:
            supabase = get_supabase_client()
            update_data = {}
            if request.budget:
                update_data["budget_constraints"] = {
                    "weekly_budget_inr": request.budget,
                    "daily_budget_inr": request.budget / 7,
                    "region": request.region
                }
            if request.calorie_target:
                update_data["nutrition_constraints"] = {
                    "daily_calories": request.calorie_target
                }
            
            if update_data:
                supabase.table("users").update(update_data).eq("id", user["id"]).execute()
        
        # Generate meal plan using complete pipeline
        result = await pipeline.generate_meal_plan(
            user_id=user["id"],
            duration_days=request.duration_days,
            use_natural_language=natural_language
        )
        
        return result
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

