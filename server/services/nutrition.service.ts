import { prisma } from "../lib/prisma";

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  calcium?: number; // mg
  iron?: number; // mg
  vitaminC?: number; // mg
}

export async function calculateIngredientNutrition(
  ingredientId: string,
  quantity: number
): Promise<NutritionInfo> {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  });

  if (!ingredient) {
    throw new Error(`Ingredient ${ingredientId} not found`);
  }

  const macros = ingredient.macrosPerUnit as {
    protein?: number;
    carbs?: number;
    fat?: number;
  } || {};

  const calories = (ingredient.caloriesPerUnit * quantity) / 100; // Assuming per 100g
  const protein = (macros.protein || 0) * quantity / 100;
  const carbs = (macros.carbs || 0) * quantity / 100;
  const fat = (macros.fat || 0) * quantity / 100;

  return {
    calories,
    protein,
    carbs,
    fat,
  };
}

export async function calculateRecipeNutrition(
  recipeId: string,
  servings: number = 1
): Promise<NutritionInfo> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!recipe) {
    throw new Error(`Recipe ${recipeId} not found`);
  }

  let totalNutrition: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  for (const recipeIngredient of recipe.ingredients) {
    const nutrition = await calculateIngredientNutrition(
      recipeIngredient.ingredientId,
      recipeIngredient.quantity
    );

    totalNutrition.calories += nutrition.calories;
    totalNutrition.protein += nutrition.protein;
    totalNutrition.carbs += nutrition.carbs;
    totalNutrition.fat += nutrition.fat;
  }

  // Adjust for servings
  const perServing = {
    calories: totalNutrition.calories / recipe.servings,
    protein: totalNutrition.protein / recipe.servings,
    carbs: totalNutrition.carbs / recipe.servings,
    fat: totalNutrition.fat / recipe.servings,
  };

  return {
    calories: perServing.calories * servings,
    protein: perServing.protein * servings,
    carbs: perServing.carbs * servings,
    fat: perServing.fat * servings,
  };
}

export async function calculateMealPlanNutrition(
  mealPlanId: string
): Promise<NutritionInfo> {
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    include: {
      days: {
        include: {
          meals: {
            include: {
              recipe: true,
            },
          },
        },
      },
    },
  });

  if (!mealPlan) {
    throw new Error(`Meal plan ${mealPlanId} not found`);
  }

  let totalNutrition: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  for (const day of mealPlan.days) {
    for (const meal of day.meals) {
      if (meal.nutrition) {
        const mealNutrition = meal.nutrition as NutritionInfo;
        totalNutrition.calories += mealNutrition.calories;
        totalNutrition.protein += mealNutrition.protein;
        totalNutrition.carbs += mealNutrition.carbs;
        totalNutrition.fat += mealNutrition.fat;
      }
    }
  }

  return totalNutrition;
}

