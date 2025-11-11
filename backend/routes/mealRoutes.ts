import express from "express";
import { generateMealPlan, nutritionSummary } from "../ai/mealGenerator";

const router = express.Router();

router.post("/generate-meal", async (req, res) => {
  try {
    const { budget, goal, dietType } = req.body;
    const mealPlan = await generateMealPlan(budget, goal, dietType);
    res.json(mealPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate meal plan" });
  }
});

router.post("/nutrition-summary", async (req, res) => {
  try {
    const { mealPlan } = req.body;
    const summary = await nutritionSummary(mealPlan);
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to summarize nutrition" });
  }
});

export default router;
