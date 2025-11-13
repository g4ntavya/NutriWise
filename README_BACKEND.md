# NutriWise Backend Documentation

Complete backend implementation for NutriWise, an AI-powered nutrition assistant.

## Features

- ✅ User Authentication (Google & Facebook OAuth)
- ✅ JWT-based session management
- ✅ AI-powered meal plan generation (OpenAI)
- ✅ Pricing calculation based on local ingredient prices
- ✅ Nutritional information calculation
- ✅ Recipe and ingredient management
- ✅ Feedback and rating system
- ✅ Grocery list generation
- ✅ Rate limiting and security middleware

## Tech Stack

- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Passport.js (Google OAuth, Facebook OAuth)
- **AI**: OpenAI GPT-4o-mini
- **Validation**: Zod
- **Security**: JWT, bcrypt, rate limiting

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```bash
createdb nutriwise
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

3. Run migrations:
```bash
pnpm db:migrate
```

4. Generate Prisma client:
```bash
pnpm db:generate
```

5. Seed the database:
```bash
pnpm db:seed
```

### 3. Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `FACEBOOK_APP_ID` & `FACEBOOK_APP_SECRET`: Facebook OAuth credentials
- `OPENAI_API_KEY`: OpenAI API key for meal plan generation
- `FRONTEND_URL`: Frontend URL for OAuth callbacks

### 4. OAuth Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8080/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

#### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set redirect URI: `http://localhost:8080/api/auth/facebook/callback`
5. Copy App ID and Secret to `.env`

### 5. Run Development Server

```bash
pnpm dev
```

The server will run on `http://localhost:8080`

## API Endpoints

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/facebook` - Initiate Facebook OAuth
- `GET /api/auth/facebook/callback` - Facebook OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke tokens

### Users

- `GET /api/users/me` - Get current user (requires auth)
- `PUT /api/users/me/preferences` - Update user preferences (requires auth)

### Meal Plans

- `POST /api/meal-plans` - Create new meal plan (requires auth)
- `GET /api/meal-plans` - List user's meal plans (requires auth)
- `GET /api/meal-plans/:id` - Get meal plan details
- `POST /api/meal-plans/:id/regenerate` - Regenerate meal plan (requires auth)
- `GET /api/meal-plans/:id/grocery-list` - Get grocery list for meal plan

### Recipes

- `GET /api/recipes` - List recipes (with filters: cuisine, tags, search, minRating)
- `GET /api/recipes/:id` - Get recipe details

### Ingredients

- `GET /api/ingredients` - List ingredients (with filters: category, search)
- `GET /api/ingredients/:id` - Get ingredient details

### Feedback

- `POST /api/feedback` - Create feedback/rating (requires auth)
- `GET /api/feedback` - Get feedback (query params: mealPlanId or recipeId)

### Config

- `GET /api/config/plan` - Get meal plan configuration (budget ranges, etc.)

## Request/Response Examples

### Create Meal Plan

```bash
POST /api/meal-plans
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "budget": 2500,
  "calorieTarget": 2000,
  "dietaryPreferences": ["VEGETARIAN", "GLUTEN_FREE"],
  "healthGoals": ["LOSE_WEIGHT"],
  "allergies": ["NUTS"],
  "durationDays": 7,
  "region": "Mumbai"
}
```

### Update User Preferences

```bash
PUT /api/users/me/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "budgetDefault": 3000,
  "dietaryPreferences": ["VEGETARIAN"],
  "healthGoals": ["MAINTAIN_HEALTH"],
  "allergies": []
}
```

## Database Schema

Key models:
- `User` - User accounts with OAuth info
- `MealPlan` - Generated meal plans
- `MealPlanDay` - Daily meal breakdown
- `Meal` - Individual meals
- `Recipe` - Recipe database
- `Ingredient` - Ingredient database with pricing
- `Feedback` - User ratings and comments

See `prisma/schema.prisma` for full schema.

## AI Meal Plan Generation

The system uses OpenAI GPT-4o-mini to generate personalized meal plans:

1. User provides preferences (budget, calories, diet, goals)
2. System fetches available recipes and ingredients from database
3. AI generates meal plan structure
4. System validates and adjusts for budget compliance
5. Meal plan is saved to database with full details

## Pricing Calculation

- Ingredients have base prices per unit
- Regional pricing can be stored in `localPrices` JSON field
- Recipe costs calculated from ingredient costs
- Meal plan costs aggregated from all meals

## Nutrition Calculation

- Ingredients store nutrition per unit
- Recipe nutrition calculated from ingredients
- Meal plan nutrition aggregated from all meals
- Supports macros (protein, carbs, fat) and micronutrients

## Security Features

- JWT-based authentication
- HTTP-only cookies for refresh tokens
- Rate limiting on all routes
- Stricter limits on auth routes
- Input validation with Zod
- CORS configuration
- SQL injection protection (Prisma)

## Testing

```bash
pnpm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production database
4. Set up proper CORS origins
5. Use HTTPS for OAuth callbacks
6. Set up monitoring and logging
7. Configure rate limiting appropriately

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database exists

### OAuth Not Working
- Verify redirect URIs match exactly
- Check client IDs/secrets are correct
- Ensure frontend URL is set correctly

### AI Generation Failing
- Verify OpenAI API key is valid
- Check API quota/limits
- Review error logs for details

## License

MIT

