import express, { Request, Response } from "express";
import { generateMealPlan } from "../ai/mealGenerator";

const router = express.Router();

router.post("/generate-meal", async (req: Request, res: Response) => {
  try {
    const { budget, goal, dietType } = req.body;

    if (!budget || !goal) {
      return res.status(400).json({ error: "Missing inputs" });
    }

    const result = await generateMealPlan(budget, goal, dietType);
    res.json(result);
  } catch (e: any) {
    console.error("AI error:", e);
    res.status(500).json({ error: "Meal generation failed" });
  }
});

export default router;
