import { RequestHandler } from "express";
import { z } from "zod";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";
import {
  createMealPlanFromAI,
  getMealPlanWithDetails,
  getUserMealPlans,
} from "../services/mealplan.service";
import { calculateMealPlanCost } from "../services/pricing.service";
import { calculateMealPlanNutrition } from "../services/nutrition.service";

const createMealPlanSchema = z.object({
  budget: z.number().min(500).max(10000),
  calorieTarget: z.number().min(1000).max(5000),
  dietaryPreferences: z.array(z.string()),
  healthGoals: z.array(z.string()),
  allergies: z.array(z.string()).optional(),
  durationDays: z.number().min(1).max(30).optional().default(7),
  region: z.string().optional(),
});

export const createMealPlan: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const body = createMealPlanSchema.parse(req.body);

    const mealPlan = await createMealPlanFromAI(req.user!.id, {
      budget: body.budget,
      calorieTarget: body.calorieTarget,
      dietaryPreferences: body.dietaryPreferences,
      healthGoals: body.healthGoals,
      allergies: body.allergies,
      durationDays: body.durationDays,
      region: body.region,
    });

    // Get full details
    const mealPlanDetails = await getMealPlanWithDetails(mealPlan.id, req.user!.id);

    // Calculate actual costs and nutrition
    const actualCost = await calculateMealPlanCost(mealPlan.id, body.region);
    const nutrition = await calculateMealPlanNutrition(mealPlan.id);

    res.status(201).json({
      ...mealPlanDetails,
      actualCost,
      nutrition,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Meal plan creation error:", error);
    res.status(500).json({ error: "Failed to create meal plan" });
  }
};

export const getMealPlan: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const mealPlan = await getMealPlanWithDetails(id, req.user?.id);

    if (!mealPlan) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    // Calculate actual costs and nutrition
    const actualCost = await calculateMealPlanCost(id);
    const nutrition = await calculateMealPlanNutrition(id);

    res.json({
      ...mealPlan,
      actualCost,
      nutrition,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meal plan" });
  }
};

export const listMealPlans: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const mealPlans = await getUserMealPlans(req.user.id);
    res.json(mealPlans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meal plans" });
  }
};

export const regenerateMealPlan: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const body = createMealPlanSchema.parse(req.body);

    // Get original meal plan to preserve user preferences
    const original = await getMealPlanWithDetails(id, req.user!.id);
    if (!original) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    // Delete old meal plan
    const { prisma } = await import("../lib/prisma");
    await prisma.mealPlan.delete({ where: { id } });

    // Create new one
    const mealPlan = await createMealPlanFromAI(req.user!.id, {
      budget: body.budget,
      calorieTarget: body.calorieTarget,
      dietaryPreferences: body.dietaryPreferences,
      healthGoals: body.healthGoals,
      allergies: body.allergies,
      durationDays: body.durationDays,
      region: body.region,
    });

    const mealPlanDetails = await getMealPlanWithDetails(mealPlan.id, req.user!.id);
    const actualCost = await calculateMealPlanCost(mealPlan.id, body.region);
    const nutrition = await calculateMealPlanNutrition(mealPlan.id);

    res.json({
      ...mealPlanDetails,
      actualCost,
      nutrition,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to regenerate meal plan" });
  }
};

export const getGroceryList: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const mealPlan = await getMealPlanWithDetails(id, req.user?.id);

    if (!mealPlan) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    const groceryList = mealPlan.ingredients.map((mpi) => ({
      ingredient: mpi.ingredient,
      quantity: mpi.totalQuantity,
      unit: mpi.ingredient.unit,
      estimatedCost: mpi.estimatedCost,
    }));

    const totalCost = groceryList.reduce((sum, item) => sum + item.estimatedCost, 0);

    res.json({
      items: groceryList,
      totalCost,
      mealPlanId: id,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch grocery list" });
  }
};

// Apply auth middleware
export const createMealPlanHandler = [authenticateToken, createMealPlan];
export const getMealPlanHandler = [optionalAuth, getMealPlan];
export const listMealPlansHandler = [authenticateToken, listMealPlans];
export const regenerateMealPlanHandler = [authenticateToken, regenerateMealPlan];
export const getGroceryListHandler = [optionalAuth, getGroceryList];


