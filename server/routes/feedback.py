"""
Feedback routes
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional
from server.services.supabase_client import get_supabase_client
from server.middleware.auth import get_current_user

router = APIRouter()

class CreateFeedbackRequest(BaseModel):
    meal_plan_id: Optional[str] = None
    recipe_id: Optional[str] = None
    rating: int
    comment: Optional[str] = None

@router.post("")
async def create_feedback(
    request: CreateFeedbackRequest,
    user: dict = Depends(get_current_user)
):
    """Create feedback/rating"""
    if not request.meal_plan_id and not request.recipe_id:
        raise HTTPException(status_code=400, detail="Either meal_plan_id or recipe_id is required")
    
    if not 1 <= request.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    supabase = get_supabase_client()
    
    try:
        feedback_data = {
            "user_id": user["id"],
            "rating": request.rating,
            "comment": request.comment
        }
        
        if request.meal_plan_id:
            feedback_data["meal_plan_id"] = request.meal_plan_id
        if request.recipe_id:
            feedback_data["recipe_id"] = request.recipe_id
        
        response = supabase.table("feedback").insert(feedback_data).execute()
        
        # Update recipe rating if applicable
        if request.recipe_id:
            # Calculate new average rating
            ratings_response = supabase.table("feedback").select("rating").eq("recipe_id", request.recipe_id).execute()
            ratings = [r["rating"] for r in ratings_response.data]
            avg_rating = sum(ratings) / len(ratings) if ratings else 0
            
            supabase.table("recipes").update({"avg_rating": avg_rating}).eq("id", request.recipe_id).execute()
        
        return response.data[0] if response.data else feedback_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def get_feedback(
    meal_plan_id: Optional[str] = Query(None),
    recipe_id: Optional[str] = Query(None)
):
    """Get feedback"""
    if not meal_plan_id and not recipe_id:
        raise HTTPException(status_code=400, detail="Either meal_plan_id or recipe_id is required")
    
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("feedback").select("*, users(*)")
        
        if meal_plan_id:
            query = query.eq("meal_plan_id", meal_plan_id)
        if recipe_id:
            query = query.eq("recipe_id", recipe_id)
        
        response = query.order("created_at", desc=True).execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

