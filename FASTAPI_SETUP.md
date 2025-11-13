# NutriWise FastAPI Backend Setup Guide

## 🚀 Complete FastAPI + Gemini + Supabase Setup

### Architecture Overview

- **Backend**: FastAPI (Python)
- **AI**: Google Gemini for meal plan generation
- **Database**: Supabase (PostgreSQL)
- **ML**: Content-based filtering with cosine similarity
- **Libraries**: scikit-learn, numpy, pandas

### Workflow

1. **User Input** → Preferences (calories, diet, goals)
2. **Vector Creation** → Nutrition/ingredient vectors using cosine similarity
3. **Similarity Matching** → Find top recipes matching user preferences
4. **Gemini Prediction** → AI generates final meal plan from recommendations

---

## Step 1: Install Python Dependencies

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Create new project
4. Wait for database to be ready

### 2.2 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - for admin operations

### 2.3 Set Up Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `supabase_schema.sql`
3. Run the SQL script
4. Verify tables are created

### 2.4 Enable OAuth Providers (Optional)

1. Go to Authentication → Providers
2. Enable Google OAuth:
   - Add Google Client ID and Secret
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`
3. Enable Facebook OAuth:
   - Add Facebook App ID and Secret
   - Set redirect URL

---

## Step 3: Get Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Copy the API key

---

## Step 4: Configure Environment Variables

Create `.env` file:

```env
# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# Frontend
FRONTEND_URL="http://localhost:5173"

# Server
PORT=8080
NODE_ENV="development"
PING_MESSAGE="pong"
```

---

## Step 5: Seed Database (Optional)

Create a Python script to seed ingredients and recipes:

```python
# scripts/seed_database.py
from supabase import create_client
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Read CSV and insert ingredients
df = pd.read_csv("dataset/Indian_Global_Foods_Nutrition_Prices_100items.csv")

for _, row in df.iterrows():
    ingredient = {
        "name": row["Item"],
        "category": "Other",  # Categorize as needed
        "calories_per_unit": float(row["Calories_kcal_per100g"]),
        "macros_per_unit": {
            "protein": float(row["Protein_g"]),
            "carbs": float(row["Carbs_g"]),
            "fat": float(row["Fat_g"])
        },
        "default_price": float(row["Price_INR_per_kg"]) / 10  # Per 100g
    }
    supabase.table("ingredients").insert(ingredient).execute()
```

Run:
```bash
python scripts/seed_database.py
```

---

## Step 6: Run FastAPI Server

```bash
# Development mode with auto-reload
uvicorn server.main:app --reload --host 0.0.0.0 --port 8080

# Or use the main.py directly
python server/main.py
```

Server will be available at:
- API: http://localhost:8080
- Docs: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

---

## Step 7: Test the API

### Health Check
```bash
curl http://localhost:8080/api/ping
```

### Get Config
```bash
curl http://localhost:8080/api/config/plan
```

### Test Meal Plan Creation (requires auth)

First, get auth token from Supabase, then:

```bash
curl -X POST http://localhost:8080/api/meal-plans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 2500,
    "calorie_target": 2000,
    "dietary_preferences": ["VEGETARIAN"],
    "health_goals": ["LOSE_WEIGHT"],
    "duration_days": 7
  }'
```

---

## How It Works

### 1. User Input
User provides:
- Budget
- Calorie target
- Dietary preferences
- Health goals
- Allergies

### 2. Vector Creation
```python
# Create user preference vector
user_vector = vectorizer.create_user_preference_vector(
    calorie_target=2000,
    protein_ratio=0.3,
    carbs_ratio=0.4,
    fat_ratio=0.3
)
```

### 3. Cosine Similarity
```python
# Find similar recipes
similar_recipes = recommender.find_similar_recipes(
    user_vector,
    recipe_vectors,
    top_k=20
)
```

### 4. Gemini Prediction
```python
# Send to Gemini with recommendations
meal_plan = gemini.generate_meal_plan(
    user_preferences=prefs,
    recommended_recipes=similar_recipes,
    budget=2500
)
```

---

## API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get profile
- `PUT /api/users/me/preferences` - Update preferences

### Meal Plans
- `POST /api/meal-plans` - Create meal plan (uses vector similarity + Gemini)
- `GET /api/meal-plans` - List user's meal plans
- `GET /api/meal-plans/{id}` - Get meal plan details
- `POST /api/meal-plans/{id}/regenerate` - Regenerate meal plan
- `GET /api/meal-plans/{id}/grocery-list` - Get grocery list

### Recipes
- `GET /api/recipes` - List recipes
- `GET /api/recipes/{id}` - Get recipe details

### Ingredients
- `GET /api/ingredients` - List ingredients
- `GET /api/ingredients/{id}` - Get ingredient details

### Feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback` - Get feedback

### Config
- `GET /api/config/plan` - Get configuration

---

## Troubleshooting

### Supabase Connection Error
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify network connectivity

### Gemini API Error
- Verify `GEMINI_API_KEY` is correct
- Check API quota/limits
- Review error logs

### Vector Calculation Error
- Ensure numpy, scikit-learn are installed
- Check ingredient/recipe data format
- Verify nutrition values are numeric

### Import Errors
- Activate virtual environment
- Run `pip install -r requirements.txt`
- Check Python version (3.9+)

---

## Production Deployment

1. Set environment variables in production
2. Use production Supabase project
3. Enable HTTPS
4. Set up proper CORS origins
5. Use production Gemini API key
6. Configure rate limiting
7. Set up monitoring

---

## Key Files

- `server/main.py` - FastAPI app entry point
- `server/services/vector_service.py` - Cosine similarity implementation
- `server/services/gemini_service.py` - Gemini AI integration
- `server/services/recommendation_service.py` - Main recommendation workflow
- `server/routes/` - API route handlers
- `supabase_schema.sql` - Database schema

---

## Next Steps

1. Seed database with ingredients and recipes
2. Test meal plan generation
3. Integrate with frontend
4. Deploy to production

For detailed API documentation, visit http://localhost:8080/docs

