import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import rateLimit from "express-rate-limit";
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth";
import * as userRoutes from "./routes/users";
import * as mealPlanRoutes from "./routes/meal-plans";
import * as recipeRoutes from "./routes/recipes";
import * as ingredientRoutes from "./routes/ingredients";
import * as feedbackRoutes from "./routes/feedback";
import * as configRoutes from "./routes/config";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  // Passport initialization
  app.use(passport.initialize());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api/", limiter);

  // Stricter rate limiting for auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many authentication attempts, please try again later.",
  });

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Config route (public)
  app.get("/api/config/plan", configRoutes.getPlanConfig);

  // Auth routes
  app.get("/api/auth/google", authLimiter, authRoutes.handleGoogleAuth);
  app.get("/api/auth/google/callback", authRoutes.handleGoogleCallback);
  app.get("/api/auth/facebook", authLimiter, authRoutes.handleFacebookAuth);
  app.get("/api/auth/facebook/callback", authRoutes.handleFacebookCallback);
  app.post("/api/auth/refresh", authRoutes.handleRefreshToken);
  app.post("/api/auth/logout", authRoutes.handleLogout);

  // User routes
  app.get("/api/users/me", ...userRoutes.getCurrentUserHandler);
  app.put("/api/users/me/preferences", ...userRoutes.updatePreferencesHandler);

  // Meal plan routes
  app.post("/api/meal-plans", ...mealPlanRoutes.createMealPlanHandler);
  app.get("/api/meal-plans", ...mealPlanRoutes.listMealPlansHandler);
  app.get("/api/meal-plans/:id", ...mealPlanRoutes.getMealPlanHandler);
  app.post("/api/meal-plans/:id/regenerate", ...mealPlanRoutes.regenerateMealPlanHandler);
  app.get("/api/meal-plans/:id/grocery-list", ...mealPlanRoutes.getGroceryListHandler);

  // Recipe routes
  app.get("/api/recipes", ...recipeRoutes.listRecipeHandler);
  app.get("/api/recipes/:id", ...recipeRoutes.getRecipeHandler);

  // Ingredient routes
  app.get("/api/ingredients", ...ingredientRoutes.listIngredientsHandler);
  app.get("/api/ingredients/:id", ...ingredientRoutes.getIngredientHandler);

  // Feedback routes
  app.post("/api/feedback", ...feedbackRoutes.createFeedbackHandler);
  app.get("/api/feedback", ...feedbackRoutes.getFeedbackHandler);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  });

  return app;
}
