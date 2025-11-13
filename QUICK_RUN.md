# 🚀 Quick Run Guide

## Run Both Frontend & Backend

### Option 1: Using the Script (Easiest)

```bash
./run.sh
```

This will:
- ✅ Set up Python virtual environment
- ✅ Install dependencies
- ✅ Start backend (port 8080)
- ✅ Start frontend (port 5173)

### Option 2: Manual (Step by Step)

#### Terminal 1 - Backend
```bash
# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start backend
uvicorn server.main:app --reload --port 8080
```

#### Terminal 2 - Frontend
```bash
# Install dependencies (first time only)
pnpm install

# Start frontend
pnpm dev
```

---

## 🌐 Access the Application

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:8080
3. **API Docs**: http://localhost:8080/docs

---

## 📱 User Flow

1. **Start Here**: http://localhost:5173/app/onboarding
   - Complete your profile (3 steps)
   - Age, weight, height, goals, preferences

2. **Generate Meal Plan**: http://localhost:5173/app/meal-plan
   - Click "Generate New Plan"
   - Wait for AI to create your meal plan (10-30 seconds)

3. **Review Meal Plan**: http://localhost:5173/app/review/:id
   - View complete meal plan
   - See nutrition validation
   - See budget validation
   - Get grocery list

---

## ⚙️ Prerequisites

- ✅ Python 3.9+
- ✅ Node.js 18+
- ✅ pnpm installed
- ✅ Supabase project set up
- ✅ Gemini API key configured
- ✅ `.env` file with credentials

---

## 🔍 Verify Setup

### Backend Health Check
```bash
curl http://localhost:8080/api/ping
# Should return: {"message":"pong"}
```

### Frontend
- Open http://localhost:5173
- Should see NutriWise homepage

### API Integration
- Open browser console (F12)
- Navigate to onboarding page
- Check for API calls in Network tab

---

## 🐛 Common Issues

### Backend won't start
- Check if port 8080 is available: `lsof -i :8080`
- Verify `.env` file exists with all required keys
- Check Supabase connection

### Frontend won't start
- Check if port 5173 is available
- Run `pnpm install` again
- Clear node_modules and reinstall

### API calls failing
- Verify backend is running
- Check CORS settings in backend
- Verify API proxy in vite.config.ts

### Meal plan not generating
- Check backend logs for errors
- Verify Gemini API key is valid
- Check Supabase database connection
- Verify user profile exists

---

## 📝 Next Steps After Running

1. ✅ Complete onboarding at `/app/onboarding`
2. ✅ Generate your first meal plan
3. ✅ Review the meal plan at `/app/review/:id`
4. ✅ Check validation results
5. ✅ Get grocery list

---

**🎉 You're all set! Start the servers and begin using NutriWise!**

