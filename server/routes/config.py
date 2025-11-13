"""
Configuration routes
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/plan")
async def get_plan_config():
    """Get meal plan configuration"""
    return {
        "budget": {
            "min": 500,
            "max": 10000,
            "default": 2500,
            "step": 100
        },
        "calories": {
            "min": 1000,
            "max": 5000,
            "default": 2000,
            "step": 50
        },
        "duration_days": {
            "min": 1,
            "max": 30,
            "default": 7
        },
        "dietary_preferences": [
            "VEGETARIAN",
            "VEGAN",
            "NON_VEGETARIAN",
            "GLUTEN_FREE",
            "DAIRY_FREE",
            "KETO",
            "PALEO"
        ],
        "health_goals": [
            "LOSE_WEIGHT",
            "GAIN_MUSCLE",
            "MAINTAIN_HEALTH",
            "IMPROVE_ENERGY"
        ]
    }

