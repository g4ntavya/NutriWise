# Frontend Integration Guide

## 🚀 Quick Start - Run Frontend with Backend

### Prerequisites
- Backend running on `http://localhost:8080`
- Node.js and pnpm installed

### Steps

1. **Install Frontend Dependencies**
```bash
pnpm install
```

2. **Start Frontend Development Server**
```bash
pnpm dev
```

Frontend will run on `http://localhost:5173`

### API Proxy
The frontend is configured to proxy `/api` requests to the backend:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- API calls: `/api/*` → automatically proxied to backend

---

## 📱 Frontend Pages

### 1. Onboarding Page (`/app/onboarding`)
- **Purpose**: Collect user profile data
- **Features**:
  - 3-step form (Basic Info → Activity & Goals → Preferences)
  - Calculates BMR, TDEE, calorie targets automatically
  - Saves profile to backend

### 2. Meal Plan Page (`/app/meal-plan`)
- **Purpose**: List and generate meal plans
- **Features**:
  - View all user's meal plans
  - Generate new meal plan using LLM
  - Click to view details

### 3. Review Page (`/app/review/:id`)
- **Purpose**: Review generated meal plan
- **Features**:
  - View complete meal plan with days and meals
  - See nutrition validation results
  - See budget validation results
  - Regenerate meal plan
  - Get grocery list

### 4. Budget Page (`/app/budget`)
- **Purpose**: Set budget and navigate to meal planning
- **Features**:
  - Budget slider
  - Redirects to onboarding if no profile

---

## 🔌 API Integration

### API Client (`client/lib/api.ts`)
Centralized API client with methods:
- `completeOnboarding(data)` - Create user profile
- `getProfile()` - Get user profile
- `createMealPlan(data)` - Generate meal plan
- `getMealPlans()` - List meal plans
- `getMealPlan(id)` - Get meal plan details
- `getGroceryList(id)` - Get grocery list

### Authentication
- Token stored in `localStorage` as `accessToken`
- Automatically included in API requests
- Set via `apiClient.setAuthToken(token)`

---

## 🎯 User Flow

```
1. User visits homepage
   ↓
2. Clicks "Set My Budget" or "Generate My Plan"
   ↓
3. Redirected to Onboarding (if no profile)
   ↓
4. Completes 3-step onboarding
   ↓
5. Redirected to Meal Plan page
   ↓
6. Clicks "Generate New Plan"
   ↓
7. Backend generates meal plan (LLM + Deterministic)
   ↓
8. Redirected to Review page
   ↓
9. Views meal plan with validation results
   ↓
10. Can regenerate, save, or get grocery list
```

---

## 🧪 Testing the Integration

### 1. Test Onboarding
```bash
# Navigate to http://localhost:5173/app/onboarding
# Fill out the form and submit
# Should redirect to meal plan page
```

### 2. Test Meal Plan Generation
```bash
# Navigate to http://localhost:5173/app/meal-plan
# Click "Generate New Plan"
# Wait for LLM to generate (may take 10-30 seconds)
# Should redirect to review page
```

### 3. Test Review Page
```bash
# After generating, you'll be on /app/review/:id
# Should see:
# - Meal plan breakdown by days
# - Nutrition validation
# - Budget validation
# - All meals with costs and calories
```

---

## 🔧 Environment Variables

Create `.env` file in root:
```env
VITE_API_URL=http://localhost:8080/api
```

If not set, defaults to `http://localhost:8080/api`

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend CORS is configured for `http://localhost:5173`
- Check `server/main.py` CORS settings

### API Connection Failed
- Verify backend is running on port 8080
- Check browser console for errors
- Verify API proxy in `vite.config.ts`

### Authentication Errors
- Check if token is stored: `localStorage.getItem("accessToken")`
- Verify backend auth middleware is working
- Check network tab for 401/403 errors

### Meal Plan Not Generating
- Check backend logs for errors
- Verify Gemini API key is set
- Check Supabase connection
- Verify user profile exists

---

## 📊 Data Flow

```
Frontend (React)
    ↓
API Client (api.ts)
    ↓
HTTP Request (/api/*)
    ↓
Vite Proxy
    ↓
Backend (FastAPI) - Port 8080
    ↓
Supabase Database
    ↓
Gemini AI (for generation)
    ↓
Response
    ↓
Frontend Display
```

---

## ✅ Checklist

- [ ] Backend running on port 8080
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 5173
- [ ] API proxy configured
- [ ] Can access onboarding page
- [ ] Can create profile
- [ ] Can generate meal plan
- [ ] Can view review page
- [ ] Validation results display correctly

---

## 🎨 UI Components Used

- **Radix UI**: Dialog, Select, Checkbox, Slider
- **TailwindCSS**: Styling
- **Lucide React**: Icons
- **React Router**: Navigation

---

## 📝 Next Steps

1. Add authentication UI (login/signup)
2. Add loading states
3. Add error handling UI
4. Add toast notifications
5. Add meal plan editing
6. Add grocery list page
7. Add meal plan sharing

---

**Ready to test!** Start both servers and navigate to `http://localhost:5173/app/onboarding`

