import { RequestHandler } from "express";

export const getPlanConfig: RequestHandler = (req, res) => {
  res.json({
    budget: {
      min: 500,
      max: 10000,
      default: 2500,
      step: 100,
    },
    calories: {
      min: 1000,
      max: 5000,
      default: 2000,
      step: 50,
    },
    durationDays: {
      min: 1,
      max: 30,
      default: 7,
    },
    dietaryPreferences: [
      "VEGETARIAN",
      "VEGAN",
      "NON_VEGETARIAN",
      "GLUTEN_FREE",
      "DAIRY_FREE",
      "KETO",
      "PALEO",
    ],
    healthGoals: [
      "LOSE_WEIGHT",
      "GAIN_MUSCLE",
      "MAINTAIN_HEALTH",
      "IMPROVE_ENERGY",
    ],
  });
};

