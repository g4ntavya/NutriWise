# NutriWise Backend Deployment Guide

## Complete Setup & Run Instructions

### Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL database (local or remote)
- Google OAuth credentials (optional for testing)
- Facebook OAuth credentials (optional for testing)
- OpenAI API key (required for meal plan generation)

---

## Step 1: Install Dependencies

```bash
# Install all dependencies
pnpm install
```

This will install:
- Backend: Express, Prisma, Passport, JWT, OpenAI, etc.
- Frontend: React, Vite, TailwindCSS, etc.
- Shared: TypeScript types

---

## Step 2: Database Setup

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql

# Create database
createdb nutriwise

# Or using psql:
psql -U postgres
CREATE DATABASE nutriwise;
\q
```

### Option B: Remote PostgreSQL (Supabase, Neon, etc.)

Use the connection string provided by your database provider.

---

## Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/nutriwise?schema=public"

# JWT Secrets (generate random strings)
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"

# Google OAuth (Optional - get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Facebook OAuth (Optional - get from https://developers.facebook.com/)
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# OpenAI API (Required for meal plan generation)
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Environment
NODE_ENV="development"
```

**Generate JWT secrets:**
```bash
# Generate random secrets
openssl rand -base64 32
openssl rand -base64 32
```

---

## Step 4: Database Migration & Seeding

```bash
# Generate Prisma Client
pnpm db:generate

# Run database migrations (creates all tables)
pnpm db:migrate

# Seed database with ingredients and sample recipes
pnpm db:seed
```

This will:
- Create all database tables (User, MealPlan, Recipe, Ingredient, etc.)
- Import ingredients from CSV files
- Create sample recipes
- Set up initial data

**Verify database:**
```bash
# Open Prisma Studio to view database
pnpm db:studio
```

---

## Step 5: OAuth Setup (Optional for Testing)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "NutriWise"
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen:
   - User type: External
   - App name: NutriWise
   - Support email: your email
   - Authorized domains: localhost (for testing)
6. Create OAuth client:
   - Application type: Web application
   - Name: NutriWise Web Client
   - Authorized redirect URIs: `http://localhost:8080/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app → "Consumer" type
3. Add "Facebook Login" product
4. Settings → Basic:
   - App Domains: `localhost`
   - Privacy Policy URL: `http://localhost:5173/privacy`
   - Terms of Service URL: `http://localhost:5173/terms`
5. Facebook Login → Settings:
   - Valid OAuth Redirect URIs: `http://localhost:8080/api/auth/facebook/callback`
6. Copy App ID and App Secret to `.env`

**Note:** OAuth is optional. You can test the backend without it, but user authentication won't work.

---

## Step 6: Run the Application

### Development Mode (Frontend + Backend)

```bash
# Start both frontend and backend on port 8080
pnpm dev
```

The application will be available at:
- Frontend: `http://localhost:5173` (or port shown in terminal)
- Backend API: `http://localhost:8080/api`

### Verify Backend is Running

```bash
# Test health endpoint
curl http://localhost:8080/api/ping

# Should return: {"message":"ping"}
```

---

## Step 7: Test the Backend

### Test Database Connection

```bash
# Check if database is accessible
pnpm db:studio
# Opens Prisma Studio at http://localhost:5555
```

### Test API Endpoints

```bash
# Get meal plan configuration
curl http://localhost:8080/api/config/plan

# List ingredients
curl http://localhost:8080/api/ingredients?limit=5

# List recipes
curl http://localhost:8080/api/recipes?limit=5
```

### Test Authentication (if OAuth is configured)

1. Open browser: `http://localhost:8080/api/auth/google`
2. Complete OAuth flow
3. You'll be redirected with an access token

### Test Meal Plan Creation (requires auth)

```bash
# First, get an access token from OAuth flow
# Then use it:

curl -X POST http://localhost:8080/api/meal-plans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 2500,
    "calorieTarget": 2000,
    "dietaryPreferences": ["VEGETARIAN"],
    "healthGoals": ["LOSE_WEIGHT"],
    "durationDays": 7
  }'
```

---

## Step 8: Frontend Integration

The frontend is already set up. To integrate with the backend:

1. **Update API calls** in frontend to use `/api` endpoints
2. **Handle OAuth redirects** at `/auth/callback?token=...`
3. **Store access token** in localStorage or state
4. **Include token** in API requests: `Authorization: Bearer <token>`

Example frontend API call:
```typescript
const response = await fetch('/api/meal-plans', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    budget: 2500,
    calorieTarget: 2000,
    dietaryPreferences: ['VEGETARIAN'],
    healthGoals: ['LOSE_WEIGHT']
  })
});
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
# macOS:
brew services list | grep postgresql

# Ubuntu:
sudo systemctl status postgresql

# Test connection
psql -U postgres -d nutriwise -c "SELECT 1;"
```

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
pnpm db:migrate reset

# Or manually drop and recreate
psql -U postgres -c "DROP DATABASE nutriwise;"
psql -U postgres -c "CREATE DATABASE nutriwise;"
pnpm db:migrate
pnpm db:seed
```

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
pnpm db:generate
```

### OAuth Redirect URI Mismatch

- Ensure redirect URIs match exactly (no trailing slashes)
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Verify OAuth app settings match callback URLs

### OpenAI API Errors

- Verify API key is correct
- Check you have credits/quota
- Review server logs for detailed errors
- Try a different model if needed

---

## Production Deployment

### Environment Variables

Set all production values:
- Strong JWT secrets
- Production database URL
- Production OAuth redirect URIs
- Production frontend URL
- `NODE_ENV=production`

### Database

1. Use managed PostgreSQL (Supabase, Neon, AWS RDS)
2. Run migrations: `pnpm db:migrate deploy`
3. Seed production data if needed

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Security Checklist

- [ ] Strong JWT secrets
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] OAuth apps configured for production

---

## Git Branch Management

### Current Branch

You're on the `backend-implementation` branch with all backend code.

### Commit Changes

```bash
# Stage all changes
git add .

# Commit
git commit -m "feat: Add complete backend implementation with database, auth, and AI meal planning"

# Push to remote (if configured)
git push origin backend-implementation
```

### Merge to Main

```bash
# Switch to main branch
git checkout main

# Merge backend branch
git merge backend-implementation

# Push to remote
git push origin main
```

---

## Quick Reference Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed database
pnpm db:studio              # Open Prisma Studio

# Testing
pnpm test                   # Run tests
pnpm typecheck              # Type check

# Git
git status                  # Check status
git add .                   # Stage changes
git commit -m "message"     # Commit
git push                    # Push to remote
```

---

## Support

- Backend API docs: See `README_BACKEND.md`
- Setup guide: See `SETUP.md`
- Prisma docs: https://www.prisma.io/docs
- Express docs: https://expressjs.com/

