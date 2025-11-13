# 🚀 NutriWise Backend - Complete Run Steps

## ✅ Current Status

- ✅ **Git Branch**: `backend-implementation`
- ✅ **All Backend Code**: Committed and ready
- ✅ **Database Schema**: Prisma models created
- ✅ **API Routes**: All endpoints implemented
- ✅ **Authentication**: Google & Facebook OAuth ready
- ✅ **AI Integration**: OpenAI meal planning configured

---

## 📋 Step-by-Step Run Instructions

### Step 1: Install Dependencies (2 minutes)

```bash
cd /Users/yashkatiyar/Desktop/NutriWise-gandmasti
pnpm install
```

**What this does:**
- Installs all backend dependencies (Express, Prisma, Passport, OpenAI, etc.)
- Installs all frontend dependencies (React, Vite, TailwindCSS, etc.)

---

### Step 2: Set Up PostgreSQL Database (5 minutes)

#### Option A: Local PostgreSQL

```bash
# Check if PostgreSQL is installed
which psql

# If not installed (macOS):
brew install postgresql
brew services start postgresql

# Create database
createdb nutriwise

# Verify
psql -U postgres -d nutriwise -c "SELECT version();"
```

#### Option B: Cloud Database (Recommended for Easy Setup)

1. **Supabase** (Free tier available):
   - Go to https://supabase.com
   - Create new project
   - Copy connection string from Settings → Database

2. **Neon** (Free tier available):
   - Go to https://neon.tech
   - Create new project
   - Copy connection string

---

### Step 3: Configure Environment Variables (3 minutes)

```bash
# Create .env file
touch .env
```

Add this content to `.env`:

```env
# Database (replace with your connection string)
DATABASE_URL="postgresql://username:password@localhost:5432/nutriwise?schema=public"

# Generate JWT secrets (run these commands and paste results)
# openssl rand -base64 32
# openssl rand -base64 32
JWT_SECRET="paste-generated-secret-here"
JWT_REFRESH_SECRET="paste-generated-secret-here"

# OpenAI API Key (REQUIRED for meal plan generation)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-your-openai-api-key-here"
OPENAI_MODEL="gpt-4o-mini"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Environment
NODE_ENV="development"

# Optional: OAuth (can skip for initial testing)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# FACEBOOK_APP_ID=""
# FACEBOOK_APP_SECRET=""
```

**Quick JWT Secret Generation:**
```bash
openssl rand -base64 32  # Copy output to JWT_SECRET
openssl rand -base64 32  # Copy output to JWT_REFRESH_SECRET
```

**Get OpenAI API Key:**
1. Sign up at https://platform.openai.com
2. Go to API Keys section
3. Create new secret key
4. Copy and paste to `.env`

---

### Step 4: Initialize Database (2 minutes)

```bash
# Generate Prisma Client
pnpm db:generate

# Create all database tables
pnpm db:migrate

# Seed database with ingredients and recipes
pnpm db:seed
```

**What this does:**
- Creates all tables: User, MealPlan, Recipe, Ingredient, Feedback, etc.
- Imports 100+ ingredients from CSV files
- Creates sample recipes
- Sets up initial data

**Verify database:**
```bash
# Open Prisma Studio (visual database browser)
pnpm db:studio
# Opens at http://localhost:5555
```

---

### Step 5: Run the Application (1 minute)

```bash
# Start development server (frontend + backend)
pnpm dev
```

**Expected output:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose

Server running on http://localhost:8080
```

**Access points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api

---

### Step 6: Test the Backend (2 minutes)

Open a new terminal and run:

```bash
# Health check
curl http://localhost:8080/api/ping
# Should return: {"message":"ping"}

# Get meal plan configuration
curl http://localhost:8080/api/config/plan

# List ingredients (first 5)
curl http://localhost:8080/api/ingredients?limit=5

# List recipes (first 5)
curl http://localhost:8080/api/recipes?limit=5
```

**If all work, backend is running correctly! ✅**

---

## 🗄️ What Data Gets Stored

### User Data (in `User` table)
- Email, name, avatar URL
- OAuth provider (Google/Facebook)
- Budget preferences
- Dietary preferences (vegetarian, vegan, etc.)
- Health goals (lose weight, gain muscle, etc.)
- Allergies list

### Meal Plans (in `MealPlan`, `MealPlanDay`, `Meal` tables)
- Generated meal plans
- Daily meal breakdowns
- Individual meals with recipes
- Cost calculations
- Nutritional information

### Recipes & Ingredients (in `Recipe`, `Ingredient` tables)
- 100+ ingredients with pricing
- Sample recipes
- Nutritional data per ingredient
- Recipe-ingredient relationships

### Feedback (in `Feedback` table)
- User ratings (1-5 stars)
- Comments on recipes and meal plans
- Timestamps

---

## 🔍 Verify Database Contents

```bash
# Open Prisma Studio
pnpm db:studio
```

Browse tables:
- **User**: User accounts
- **Ingredient**: All ingredients (100+)
- **Recipe**: Sample recipes
- **MealPlan**: Generated meal plans
- **Feedback**: User ratings

---

## 🧪 Test Meal Plan Creation (Requires Auth)

### Option 1: Using OAuth (if configured)

1. Open browser: `http://localhost:8080/api/auth/google`
2. Complete OAuth flow
3. You'll be redirected with access token
4. Use token in API calls

### Option 2: Manual Testing (without OAuth)

You can test the backend without OAuth by:
1. Creating a user directly in database (via Prisma Studio)
2. Generating a test JWT token
3. Using it in API calls

---

## 📁 Git Branch Information

**Current Branch:** `backend-implementation`

**View commits:**
```bash
git log --oneline
```

**Switch branches:**
```bash
git checkout main                    # Switch to main
git checkout backend-implementation  # Switch back
```

**View all files:**
```bash
git status
```

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql     # Linux

# Test connection
psql -U postgres -d nutriwise -c "SELECT 1;"

# If database doesn't exist
createdb nutriwise
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
pnpm db:generate
```

### Issue: "Port 8080 already in use"

**Solution:**
```bash
# Find process
lsof -i :8080

# Kill it
kill -9 <PID>
```

### Issue: "Migration failed"

**Solution:**
```bash
# Reset database (WARNING: deletes data)
pnpm db:migrate reset

# Or manually
psql -U postgres -c "DROP DATABASE nutriwise;"
psql -U postgres -c "CREATE DATABASE nutriwise;"
pnpm db:migrate
pnpm db:seed
```

### Issue: "OpenAI API error"

**Solution:**
- Verify API key is correct in `.env`
- Check you have credits at https://platform.openai.com
- Review server logs for detailed error

---

## 📚 Additional Documentation

- **Quick Start**: `QUICK_START.md` - 5-minute setup
- **Full Setup**: `SETUP.md` - Detailed setup guide
- **Deployment**: `DEPLOYMENT.md` - Production deployment
- **API Docs**: `README_BACKEND.md` - Complete API documentation

---

## ✅ Success Checklist

- [ ] Dependencies installed (`pnpm install`)
- [ ] Database created and connected
- [ ] `.env` file configured
- [ ] Database migrated (`pnpm db:migrate`)
- [ ] Database seeded (`pnpm db:seed`)
- [ ] Server running (`pnpm dev`)
- [ ] Health check passes (`curl http://localhost:8080/api/ping`)
- [ ] Can list ingredients (`curl http://localhost:8080/api/ingredients`)

---

## 🎯 Next Steps After Setup

1. **Integrate Frontend**: Connect frontend to API endpoints
2. **Set Up OAuth**: Configure Google/Facebook OAuth (optional)
3. **Test Meal Plans**: Create test meal plans via API
4. **Deploy**: Follow `DEPLOYMENT.md` for production

---

## 💡 Quick Commands Reference

```bash
# Development
pnpm dev                    # Start server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed database
pnpm db:studio              # Open Prisma Studio

# Git
git status                  # Check status
git log --oneline           # View commits
git branch                  # List branches
```

---

**🎉 You're all set! The backend is ready to use.**

For detailed API documentation, see `README_BACKEND.md`

