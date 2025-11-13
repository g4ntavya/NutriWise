/**
 * Shared API types between client and server
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  budgetDefault: number | null;
  dietaryPreferences: string[] | null;
  healthGoals: string[] | null;
  allergies: string[] | null;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

// Meal Plan types
export interface MealPlanRequest {
  budget: number;
  calorieTarget: number;
  dietaryPreferences: string[];
  healthGoals: string[];
  allergies?: string[];
  durationDays?: number;
  region?: string;
}

export interface Meal {
  id: string;
  name: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  recipeId: string | null;
  servings: number;
  cost: number;
  calories: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  recipe?: Recipe;
}

export interface MealPlanDay {
  id: string;
  dayIndex: number;
  totalCalories: number;
  totalCost: number;
  meals: Meal[];
}

export interface MealPlan {
  id: string;
  userId: string;
  title: string | null;
  description: string | null;
  calorieTarget: number;
  macroDistribution: {
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  totalCost: number;
  durationDays: number;
  budget: number;
  createdAt: Date;
  days: MealPlanDay[];
  ingredients?: GroceryItem[];
  actualCost?: number;
  nutrition?: NutritionInfo;
}

export interface GroceryItem {
  ingredient: Ingredient;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

export interface GroceryList {
  items: GroceryItem[];
  totalCost: number;
  mealPlanId: string;
}

// Recipe types
export interface RecipeIngredient {
  id: string;
  quantity: number;
  ingredient: Ingredient;
}

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  imageUrl: string | null;
  cuisine: string | null;
  tags: string[];
  avgRating: number;
  totalTime: number | null;
  calories: number;
  macroBreakdown: {
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  servings: number;
  ingredients: RecipeIngredient[];
  feedbacks?: Feedback[];
}

// Ingredient types
export interface Ingredient {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  caloriesPerUnit: number;
  macrosPerUnit: {
    protein?: number;
    carbs?: number;
    fat?: number;
  } | null;
  defaultPrice: number;
  localPrices: Record<string, number> | null;
}

// Nutrition types
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  calcium?: number;
  iron?: number;
  vitaminC?: number;
}

// Feedback types
export interface Feedback {
  id: string;
  userId: string;
  mealPlanId: string | null;
  recipeId: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateFeedbackRequest {
  mealPlanId?: string;
  recipeId?: string;
  rating: number;
  comment?: string;
}

// Config types
export interface PlanConfig {
  budget: {
    min: number;
    max: number;
    default: number;
    step: number;
  };
  calories: {
    min: number;
    max: number;
    default: number;
    step: number;
  };
  durationDays: {
    min: number;
    max: number;
    default: number;
  };
  dietaryPreferences: string[];
  healthGoals: string[];
}

// API Response types
export interface ApiError {
  error: string | Array<{ path: string[]; message: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Demo response (existing)
export interface DemoResponse {
  message: string;
}
