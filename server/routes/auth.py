"""
Authentication routes using Supabase Auth
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
import os
from server.services.supabase_client import get_supabase_client
from server.middleware.auth import get_current_user

router = APIRouter()

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.get("/google")
async def google_auth():
    """Initiate Google OAuth via Supabase"""
    supabase = get_supabase_client()
    # Supabase handles OAuth redirects
    return {"message": "Redirect to Supabase Google OAuth"}

@router.get("/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback"""
    supabase = get_supabase_client()
    try:
        response = supabase.auth.exchange_code_for_session(code)
        if response.session:
            # Redirect to frontend with tokens
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            return RedirectResponse(
                url=f"{frontend_url}/auth/callback?token={response.session.access_token}"
            )
        raise HTTPException(status_code=400, detail="Failed to authenticate")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/facebook")
async def facebook_auth():
    """Initiate Facebook OAuth via Supabase"""
    supabase = get_supabase_client()
    return {"message": "Redirect to Supabase Facebook OAuth"}

@router.get("/facebook/callback")
async def facebook_callback(code: str):
    """Handle Facebook OAuth callback"""
    supabase = get_supabase_client()
    try:
        response = supabase.auth.exchange_code_for_session(code)
        if response.session:
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            return RedirectResponse(
                url=f"{frontend_url}/auth/callback?token={response.session.access_token}"
            )
        raise HTTPException(status_code=400, detail="Failed to authenticate")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token"""
    supabase = get_supabase_client()
    try:
        response = supabase.auth.refresh_session(request.refresh_token)
        if response.session:
            return {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token
            }
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    """Logout user"""
    supabase = get_supabase_client()
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

