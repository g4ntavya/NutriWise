"""
NutriWise FastAPI Backend
AI-powered nutrition assistant with Gemini AI and Supabase
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from server.routes import auth, users, meal_plans, recipes, ingredients, feedback, config, onboarding
from server.services.supabase_client import get_supabase_client
from server.middleware.auth import get_current_user

load_dotenv()

# Security scheme
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    print("🚀 Starting NutriWise FastAPI Backend...")
    # Initialize Supabase connection
    supabase = get_supabase_client()
    print("✅ Supabase connected")
    yield
    # Shutdown
    print("👋 Shutting down NutriWise Backend...")

app = FastAPI(
    title="NutriWise API",
    description="AI-powered nutrition assistant with Gemini AI and content-based filtering",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("FRONTEND_URL", "http://localhost:5177").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["Onboarding"])
app.include_router(meal_plans.router, prefix="/api/meal-plans", tags=["Meal Plans"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["Recipes"])
app.include_router(ingredients.router, prefix="/api/ingredients", tags=["Ingredients"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(config.router, prefix="/api/config", tags=["Config"])

@app.get("/api/ping")
async def ping():
    """Health check endpoint"""
    return {"message": os.getenv("PING_MESSAGE", "pong")}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NutriWise API",
        "version": "2.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server.main:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )

