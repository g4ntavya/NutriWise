# NutriWise Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nutriwise?schema=public"

# JWT Secrets (generate strong random strings)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# OAuth - Google (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OAuth - Facebook (get from Facebook Developers)
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# OpenAI (get from OpenAI Platform)
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Environment
NODE_ENV="development"
```

### 3. Set Up Database

```bash
# Create PostgreSQL database
createdb nutriwise

# Run migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Seed database with ingredients and recipes
pnpm db:seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Server will be available at `http://localhost:8080`

## OAuth Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted
6. Application type: "Web application"
7. Authorized redirect URIs: `http://localhost:8080/api/auth/google/callback`
8. Copy Client ID and Client Secret to `.env`

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Go to Settings → Basic
5. Add platform: Website
6. Site URL: `http://localhost:8080`
7. Valid OAuth Redirect URIs: `http://localhost:8080/api/auth/facebook/callback`
8. Copy App ID and App Secret to `.env`

## Testing the API

### Test Authentication

```bash
# Test Google OAuth
curl http://localhost:8080/api/auth/google

# Test Facebook OAuth
curl http://localhost:8080/api/auth/facebook
```

### Test Meal Plan Creation (requires auth token)

```bash
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

## Frontend Integration

The frontend should make requests to:
- Base URL: `http://localhost:8080/api`
- Include `Authorization: Bearer <token>` header for protected routes
- Handle OAuth redirects at `/auth/callback?token=<access_token>`

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check database exists: `psql -l | grep nutriwise`

### OAuth Not Working
- Verify redirect URIs match exactly (no trailing slashes)
- Check client IDs/secrets are correct
- Ensure OAuth apps are in development mode (for testing)

### AI Generation Failing
- Verify OpenAI API key is valid
- Check you have credits/quota
- Review server logs for detailed errors

### Prisma Errors
- Run `pnpm db:generate` after schema changes
- Run `pnpm db:migrate` to apply migrations
- Check Prisma Studio: `pnpm db:studio`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, random JWT secrets
3. Configure production database
4. Update OAuth redirect URIs to production URLs
5. Set `FRONTEND_URL` to production frontend URL
6. Enable HTTPS
7. Configure proper CORS origins
8. Set up monitoring and error tracking

## Next Steps

- Review `README_BACKEND.md` for detailed API documentation
- Check `shared/api.ts` for TypeScript types
- Explore `server/routes/` for available endpoints

