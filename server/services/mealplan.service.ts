import { prisma } from "../lib/prisma";
import { generateMealPlan, GeneratedMealPlan, MealPlanRequest } from "./ai.service";
import { calculateRecipeNutrition } from "./nutrition.service";
import { calculateRecipeCost } from "./pricing.service";
import { MealType } from "@prisma/client";

export async function createMealPlanFromAI(
  userId: string,
  request: MealPlanRequest
) {
  // Generate meal plan using AI
  const generatedPlan = await generateMealPlan(request);

  // Calculate macro distribution
  const macroDistribution = {
    protein: 30, // Default percentages
    carbs: 40,
    fat: 30,
  };

  // Create meal plan in database
  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId,
      calorieTarget: request.calorieTarget,
      macroDistribution,
      totalCost: generatedPlan.totalCost,
      budget: request.budget,
      durationDays: request.durationDays || 7,
      title: `Meal Plan - ${new Date().toLocaleDateString()}`,
      description: `Personalized meal plan for ${request.healthGoals.join(", ")}`,
    },
  });

  // Create days and meals
  for (const day of generatedPlan.days) {
    const mealPlanDay = await prisma.mealPlanDay.create({
      data: {
        mealPlanId: mealPlan.id,
        dayIndex: day.dayIndex,
        totalCalories: day.totalCalories,
        totalCost: day.totalCost,
      },
    });

    for (const meal of day.meals) {
      let recipeId: string | null = null;
      let nutrition = {
        calories: meal.estimatedCalories,
        protein: meal.estimatedCalories * 0.15, // Rough estimate
        carbs: meal.estimatedCalories * 0.5,
        fat: meal.estimatedCalories * 0.35,
      };

      // Try to find matching recipe
      if (meal.recipeName) {
        const recipe = await prisma.recipe.findFirst({
          where: {
            name: {
              contains: meal.recipeName,
              mode: "insensitive",
            },
          },
        });

        if (recipe) {
          recipeId = recipe.id;
          // Calculate actual nutrition
          const actualNutrition = await calculateRecipeNutrition(
            recipe.id,
            meal.estimatedCalories / recipe.calories // Estimate servings
          );
          nutrition = {
            calories: actualNutrition.calories,
            protein: actualNutrition.protein,
            carbs: actualNutrition.carbs,
            fat: actualNutrition.fat,
          };
        }
      }

      await prisma.meal.create({
        data: {
          mealPlanDayId: mealPlanDay.id,
          name: meal.name,
          mealType: meal.mealType as MealType,
          recipeId,
          servings: 1,
          cost: meal.estimatedCost,
          calories: nutrition.calories,
          nutrition,
        },
      });
    }
  }

  // Generate grocery list
  await generateGroceryList(mealPlan.id);

  return mealPlan;
}

async function generateGroceryList(mealPlanId: string) {
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

  if (!mealPlan) return;

  // Aggregate ingredients
  const ingredientMap = new Map<string, { quantity: number; cost: number }>();

  for (const day of mealPlan.days) {
    for (const meal of day.meals) {
      if (meal.recipe) {
        for (const recipeIngredient of meal.recipe.ingredients) {
          const existing = ingredientMap.get(recipeIngredient.ingredientId) || {
            quantity: 0,
            cost: 0,
          };

          const quantity = recipeIngredient.quantity * meal.servings;
          const cost = quantity * recipeIngredient.ingredient.defaultPrice;

          ingredientMap.set(recipeIngredient.ingredientId, {
            quantity: existing.quantity + quantity,
            cost: existing.cost + cost,
          });
        }
      }
    }
  }

  // Create or update meal plan ingredients
  for (const [ingredientId, totals] of ingredientMap.entries()) {
    await prisma.mealPlanIngredient.upsert({
      where: {
        mealPlanId_ingredientId: {
          mealPlanId,
          ingredientId,
        },
      },
      create: {
        mealPlanId,
        ingredientId,
        totalQuantity: totals.quantity,
        estimatedCost: totals.cost,
      },
      update: {
        totalQuantity: totals.quantity,
        estimatedCost: totals.cost,
      },
    });
  }
}

export async function getMealPlanWithDetails(mealPlanId: string, userId?: string) {
  const mealPlan = await prisma.mealPlan.findUnique({
    where: {
      id: mealPlanId,
      ...(userId ? { userId } : {}),
    },
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
            orderBy: {
              mealType: "asc",
            },
          },
        },
        orderBy: {
          dayIndex: "asc",
        },
      },
      ingredients: {
        include: {
          ingredient: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return mealPlan;
}

export async function getUserMealPlans(userId: string) {
  return prisma.mealPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      days: {
        take: 1, // Just get first day for preview
        include: {
          meals: {
            take: 3,
          },
        },
      },
    },
  });
}

