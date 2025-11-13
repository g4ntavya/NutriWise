# NutriWise Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb nutriwise
```

**Option B: Use Supabase/Neon (Cloud)**
- Sign up at https://supabase.com or https://neon.tech
- Copy connection string

### 3. Configure Environment

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nutriwise"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
OPENAI_API_KEY="sk-your-key-here"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

**Get OpenAI API Key:**
- Sign up at https://platform.openai.com
- Go to API Keys section
- Create new key

### 4. Initialize Database
```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Create tables
pnpm db:seed        # Load ingredients & recipes
```

### 5. Run Application
```bash
pnpm dev
```

✅ **Done!** Backend running on `http://localhost:8080`

---

## 📋 What Gets Stored in Database

### User Data
- ✅ Email, name, avatar
- ✅ OAuth provider info (Google/Facebook)
- ✅ Budget preferences
- ✅ Dietary preferences (vegetarian, vegan, etc.)
- ✅ Health goals (lose weight, gain muscle, etc.)
- ✅ Allergies

### Meal Plans
- ✅ Generated meal plans with days and meals
- ✅ Cost calculations
- ✅ Nutritional breakdowns
- ✅ Recipe associations

### Recipes & Ingredients
- ✅ 100+ ingredients from CSV with pricing
- ✅ Sample recipes
- ✅ Nutritional data
- ✅ Cost per unit

### Feedback
- ✅ User ratings for recipes and meal plans
- ✅ Comments and reviews

---

## 🧪 Test the Backend

```bash
# Health check
curl http://localhost:8080/api/ping

# Get config
curl http://localhost:8080/api/config/plan

# List ingredients
curl http://localhost:8080/api/ingredients?limit=5

# List recipes
curl http://localhost:8080/api/recipes?limit=5
```

---

## 📁 Current Git Branch

You're on: **`backend-implementation`**

All backend code is committed to this branch.

### View Changes
```bash
git log --oneline
```

### Switch Branches
```bash
git checkout main          # Switch to main
git checkout backend-implementation  # Switch back
```

---

## 🔧 Common Issues

### Database Connection Error
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Test connection
psql -U postgres -d nutriwise -c "SELECT 1;"
```

### Prisma Errors
```bash
pnpm db:generate  # Regenerate client
pnpm db:migrate   # Run migrations
```

### Port Already in Use
```bash
lsof -i :8080     # Find process
kill -9 <PID>     # Kill it
```

---

## 📚 Full Documentation

- **Setup Guide**: See `SETUP.md`
- **Deployment**: See `DEPLOYMENT.md`
- **API Docs**: See `README_BACKEND.md`

---

## 🎯 Next Steps

1. ✅ Backend is ready
2. 🔄 Integrate frontend with API endpoints
3. 🔐 Set up OAuth (optional for testing)
4. 🚀 Deploy to production

---

**Need Help?** Check `DEPLOYMENT.md` for detailed troubleshooting.

