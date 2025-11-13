"""
Recipe routes
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from server.services.supabase_client import get_supabase_client
from server.middleware.auth import optional_auth

router = APIRouter()

@router.get("")
async def list_recipes(
    cuisine: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: Optional[dict] = Depends(optional_auth)
):
    """List recipes with filters"""
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("recipes").select("*")
        
        if cuisine:
            query = query.eq("cuisine", cuisine)
        
        if min_rating:
            query = query.gte("avg_rating", min_rating)
        
        if search:
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")
        
        if tags:
            tag_list = tags.split(",")
            for tag in tag_list:
                query = query.contains("tags", [tag])
        
        response = query.order("avg_rating", desc=True).range(offset, offset + limit - 1).execute()
        
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{recipe_id}")
async def get_recipe(
    recipe_id: str,
    user: Optional[dict] = Depends(optional_auth)
):
    """Get recipe details"""
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("recipes").select("*").eq("id", recipe_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        # Get feedback if available
        feedback_response = supabase.table("feedback").select("*").eq("recipe_id", recipe_id).order("created_at", desc=True).limit(10).execute()
        
        recipe = response.data[0]
        recipe["feedbacks"] = feedback_response.data or []
        
        return recipe
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

