import { prisma } from "../lib/prisma";

export interface IngredientPricing {
  ingredientId: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalCost: number;
}

export async function calculateIngredientCost(
  ingredientId: string,
  quantity: number,
  region?: string
): Promise<IngredientPricing> {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  });

  if (!ingredient) {
    throw new Error(`Ingredient ${ingredientId} not found`);
  }

  // Get price (prefer region-specific, fallback to default)
  let pricePerUnit = ingredient.defaultPrice;
  if (region && ingredient.localPrices) {
    const localPrices = ingredient.localPrices as Record<string, number>;
    if (localPrices[region]) {
      pricePerUnit = localPrices[region];
    }
  }

  const totalCost = pricePerUnit * quantity;

  return {
    ingredientId,
    quantity,
    unit: ingredient.unit,
    pricePerUnit,
    totalCost,
  };
}

export async function calculateRecipeCost(
  recipeId: string,
  servings: number = 1,
  region?: string
): Promise<number> {
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

  let totalCost = 0;

  for (const recipeIngredient of recipe.ingredients) {
    const pricing = await calculateIngredientCost(
      recipeIngredient.ingredientId,
      recipeIngredient.quantity,
      region
    );
    totalCost += pricing.totalCost;
  }

  // Cost per serving
  return totalCost / recipe.servings * servings;
}

export async function calculateMealPlanCost(
  mealPlanId: string,
  region?: string
): Promise<number> {
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    include: {
      days: {
        include: {
          meals: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!mealPlan) {
    throw new Error(`Meal plan ${mealPlanId} not found`);
  }

  let totalCost = 0;

  for (const day of mealPlan.days) {
    for (const meal of day.meals) {
      if (meal.recipeId) {
        const mealCost = await calculateRecipeCost(
          meal.recipeId,
          meal.servings,
          region
        );
        totalCost += mealCost;
      } else {
        // Direct cost if no recipe
        totalCost += meal.cost;
      }
    }
  }

  return totalCost;
}

