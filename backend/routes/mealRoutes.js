const express = require('express');
const { generateMealPlan, nutritionSummary } = require('../ai/mealGenerator');

const router = express.Router();

router.post('/generate-meal', async (req, res) => {
  try {
    const { budget, goal, dietType } = req.body;
    const mealPlan = await generateMealPlan(budget, goal, dietType);
    res.json(mealPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate meal plan' });
  }
});

router.post('/nutrition-summary', async (req, res) => {
  try {
    const { mealPlan } = req.body;
    const summary = await nutritionSummary(mealPlan);
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to summarize nutrition' });
  }
});

module.exports = router;
