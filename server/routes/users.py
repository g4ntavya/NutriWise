"""
User management routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from server.services.supabase_client import get_supabase_client
from server.middleware.auth import get_current_user

router = APIRouter()

class UpdatePreferencesRequest(BaseModel):
    budget_default: Optional[float] = None
    dietary_preferences: Optional[List[str]] = None
    health_goals: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

@router.get("/me")
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """Get current user profile"""
    supabase = get_supabase_client()
    
    try:
        # Fetch user profile from users table
        response = supabase.table("users").select("*").eq("id", user["id"]).execute()
        
        if response.data:
            return response.data[0]
        else:
            # Create default profile if doesn't exist
            new_user = {
                "id": user["id"],
                "email": user["email"],
                "name": user.get("user_metadata", {}).get("name"),
                "avatar_url": user.get("user_metadata", {}).get("avatar_url")
            }
            supabase.table("users").insert(new_user).execute()
            return new_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/me/preferences")
async def update_preferences(
    request: UpdatePreferencesRequest,
    user: dict = Depends(get_current_user)
):
    """Update user preferences"""
    supabase = get_supabase_client()
    
    update_data = {}
    if request.budget_default is not None:
        update_data["budget_default"] = request.budget_default
    if request.dietary_preferences is not None:
        update_data["dietary_preferences"] = request.dietary_preferences
    if request.health_goals is not None:
        update_data["health_goals"] = request.health_goals
    if request.allergies is not None:
        update_data["allergies"] = request.allergies
    
    try:
        response = supabase.table("users").update(update_data).eq("id", user["id"]).execute()
        return response.data[0] if response.data else update_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

