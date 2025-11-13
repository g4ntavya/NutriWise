import OpenAI from "openai";
import { prisma } from "../lib/prisma";
import { calculateRecipeCost } from "./pricing.service";
import { calculateRecipeNutrition } from "./nutrition.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MealPlanRequest {
  budget: number; // weekly budget in INR
  calorieTarget: number; // daily calories
  dietaryPreferences: string[]; // e.g., ["VEGETARIAN", "GLUTEN_FREE"]
  healthGoals: string[]; // e.g., ["LOSE_WEIGHT", "GAIN_MUSCLE"]
  allergies?: string[];
  durationDays?: number;
  region?: string;
}

export interface GeneratedMeal {
  name: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  recipeName?: string;
  ingredients: string[];
  estimatedCalories: number;
  estimatedCost: number;
}

export interface GeneratedDay {
  dayIndex: number;
  meals: GeneratedMeal[];
  totalCalories: number;
  totalCost: number;
}

export interface GeneratedMealPlan {
  days: GeneratedDay[];
  totalCost: number;
  averageDailyCalories: number;
}

export async function generateMealPlan(
  request: MealPlanRequest
): Promise<GeneratedMealPlan> {
  // Get available recipes from database
  const recipes = await prisma.recipe.findMany({
    take: 100, // Limit for AI context
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  // Get available ingredients
  const ingredients = await prisma.ingredient.findMany({
    take: 200,
  });

  // Build context for AI
  const recipeContext = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    calories: r.calories,
    cuisine: r.cuisine,
    tags: r.tags,
    ingredients: r.ingredients.map((ri) => ({
      name: ri.ingredient.name,
      quantity: ri.quantity,
      unit: ri.ingredient.unit,
    })),
  }));

  const ingredientContext = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    price: i.defaultPrice,
    calories: i.caloriesPerUnit,
  }));

  // Create AI prompt
  const prompt = `You are a nutrition expert creating a personalized meal plan. Generate a ${request.durationDays || 7}-day meal plan with the following requirements:

Budget: ₹${request.budget} per week (approximately ₹${Math.round(request.budget / (request.durationDays || 7))} per day)
Daily Calorie Target: ${request.calorieTarget} calories
Dietary Preferences: ${request.dietaryPreferences.join(", ")}
Health Goals: ${request.healthGoals.join(", ")}
${request.allergies && request.allergies.length > 0 ? `Allergies to avoid: ${request.allergies.join(", ")}` : ""}

Available Recipes:
${JSON.stringify(recipeContext, null, 2)}

Available Ingredients:
${JSON.stringify(ingredientContext.slice(0, 50), null, 2)}

Generate a meal plan that:
1. Stays within the budget
2. Meets calorie targets
3. Respects dietary preferences and allergies
4. Includes variety across days
5. Uses recipes from the available list when possible, or suggests new combinations

Return a JSON object with this structure:
{
  "days": [
    {
      "dayIndex": 0,
      "meals": [
        {
          "name": "Meal name",
          "mealType": "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
          "recipeName": "Recipe name if using existing recipe",
          "ingredients": ["ingredient1", "ingredient2"],
          "estimatedCalories": 400,
          "estimatedCost": 150
        }
      ],
      "totalCalories": 2000,
      "totalCost": 350
    }
  ],
  "totalCost": 2450,
  "averageDailyCalories": 2000
}

Return ONLY valid JSON, no markdown formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a nutrition expert. Always return valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    const mealPlan = JSON.parse(responseText) as GeneratedMealPlan;

    // Validate and adjust meal plan
    return validateAndAdjustMealPlan(mealPlan, request);
  } catch (error) {
    console.error("AI generation error:", error);
    // Fallback to a simple meal plan
    return generateFallbackMealPlan(request);
  }
}

function validateAndAdjustMealPlan(
  mealPlan: GeneratedMealPlan,
  request: MealPlanRequest
): GeneratedMealPlan {
  // Ensure budget compliance
  const dailyBudget = request.budget / (request.durationDays || 7);
  
  for (const day of mealPlan.days) {
    if (day.totalCost > dailyBudget * 1.1) {
      // Reduce costs if over budget
      const scale = (dailyBudget * 1.05) / day.totalCost;
      day.totalCost *= scale;
      for (const meal of day.meals) {
        meal.estimatedCost *= scale;
      }
    }
  }

  return mealPlan;
}

function generateFallbackMealPlan(
  request: MealPlanRequest
): GeneratedMealPlan {
  // Simple fallback meal plan
  const days: GeneratedDay[] = [];
  const dailyCalories = request.calorieTarget;
  const dailyBudget = request.budget / (request.durationDays || 7);

  for (let i = 0; i < (request.durationDays || 7); i++) {
    days.push({
      dayIndex: i,
      meals: [
        {
          name: "Breakfast",
          mealType: "BREAKFAST",
          ingredients: ["Oats", "Banana", "Milk"],
          estimatedCalories: dailyCalories * 0.25,
          estimatedCost: dailyBudget * 0.2,
        },
        {
          name: "Lunch",
          mealType: "LUNCH",
          ingredients: ["Rice", "Dal", "Vegetables"],
          estimatedCalories: dailyCalories * 0.4,
          estimatedCost: dailyBudget * 0.4,
        },
        {
          name: "Dinner",
          mealType: "DINNER",
          ingredients: ["Roti", "Curry", "Salad"],
          estimatedCalories: dailyCalories * 0.35,
          estimatedCost: dailyBudget * 0.4,
        },
      ],
      totalCalories: dailyCalories,
      totalCost: dailyBudget,
    });
  }

  return {
    days,
    totalCost: request.budget,
    averageDailyCalories: dailyCalories,
  };
}

