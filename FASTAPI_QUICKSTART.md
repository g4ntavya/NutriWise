# 🚀 FastAPI Backend - Quick Start

## Complete Conversion Summary

✅ **Backend**: FastAPI (Python) - replaces Express/Node.js  
✅ **AI**: Google Gemini - replaces OpenAI  
✅ **Database**: Supabase - replaces PostgreSQL + Prisma  
✅ **ML**: Cosine similarity (scikit-learn) for content-based filtering  
✅ **Workflow**: User input → Vector → Similarity → Gemini prediction

---

## ⚡ 5-Minute Setup

### 1. Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Set Up Supabase

1. Go to https://supabase.com → Create project
2. Get credentials from Settings → API:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run SQL schema:
   - Go to SQL Editor
   - Copy/paste `supabase_schema.sql`
   - Execute

### 3. Get Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Copy key

### 4. Configure Environment

Create `.env`:

```env
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-key"
GEMINI_API_KEY="your-gemini-key"
GEMINI_MODEL="gemini-1.5-flash"
FRONTEND_URL="http://localhost:5173"
```

### 5. Seed Database

```bash
python scripts/seed_supabase.py
```

### 6. Run Server

```bash
uvicorn server.main:app --reload --port 8080
```

✅ **Done!** API at http://localhost:8080/docs

---

## 🔄 How It Works

### Workflow

```
User Input (budget, calories, preferences)
    ↓
Create User Vector (nutrition preferences)
    ↓
Calculate Cosine Similarity with Recipe Vectors
    ↓
Get Top 20 Similar Recipes
    ↓
Send to Gemini AI with Recommendations
    ↓
Gemini Generates Final Meal Plan
```

### Code Flow

1. **User Input** → `POST /api/meal-plans`
2. **Vector Creation** → `vector_service.py` creates nutrition vectors
3. **Similarity** → `CosineSimilarityRecommender` finds matches
4. **Recommendations** → Top recipes selected
5. **Gemini** → `gemini_service.py` generates meal plan
6. **Response** → Meal plan returned to user

---

## 📁 Key Files

- `server/main.py` - FastAPI app
- `server/services/vector_service.py` - Cosine similarity
- `server/services/gemini_service.py` - Gemini AI
- `server/services/recommendation_service.py` - Main workflow
- `server/routes/meal_plans.py` - Meal plan endpoint
- `supabase_schema.sql` - Database schema

---

## 🧪 Test

```bash
# Health check
curl http://localhost:8080/api/ping

# Get config
curl http://localhost:8080/api/config/plan

# Create meal plan (needs auth token)
curl -X POST http://localhost:8080/api/meal-plans \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 2500,
    "calorie_target": 2000,
    "dietary_preferences": ["VEGETARIAN"],
    "health_goals": ["LOSE_WEIGHT"]
  }'
```

---

## 📚 Full Documentation

See `FASTAPI_SETUP.md` for detailed setup instructions.

---

## 🔄 Migration from Node.js

**Old (Node.js/Express):**
- Prisma ORM
- PostgreSQL direct connection
- OpenAI GPT-4
- Express routes

**New (FastAPI):**
- Supabase client
- Supabase PostgreSQL
- Gemini AI
- FastAPI routes
- Cosine similarity ML

All endpoints remain the same, just different backend!

---

**Current Branch**: `backend-implementation`  
**Status**: ✅ FastAPI backend ready

