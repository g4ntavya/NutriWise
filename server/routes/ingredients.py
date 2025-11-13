"""
Ingredient routes
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from server.services.supabase_client import get_supabase_client
from server.middleware.auth import optional_auth

router = APIRouter()

@router.get("")
async def list_ingredients(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: Optional[dict] = Depends(optional_auth)
):
    """List ingredients with filters"""
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("ingredients").select("*")
        
        if category:
            query = query.eq("category", category)
        
        if search:
            query = query.ilike("name", f"%{search}%")
        
        response = query.order("name").range(offset, offset + limit - 1).execute()
        
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ingredient_id}")
async def get_ingredient(
    ingredient_id: str,
    user: Optional[dict] = Depends(optional_auth)
):
    """Get ingredient details"""
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("ingredients").select("*").eq("id", ingredient_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Ingredient not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

