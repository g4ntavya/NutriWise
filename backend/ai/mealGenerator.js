const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load ingredients data
const ingredientsPath = path.resolve(__dirname, '../data/ingredients_india.json');
const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf-8'));

async function generateMealPlan(budget, goal, dietType) {
  // Filter ingredients by diet type
  const suitable = ingredients.filter(item => item.diet.includes(dietType));
  // Simple rule-based selection: pick up to three ingredients within budget
  const dailyBudget = budget / 3;
  const selected = suitable.filter(item => item.cost_per_serving <= dailyBudget).slice(0, 3);
  const ingredientNames = selected.map(i => i.name).join(', ');
  // Build prompt for OpenAI
  const prompt = `\nYou are NutriWise, an AI meal planner.\nCreate a one-day meal plan (breakfast, lunch, dinner) for the following:\nGoal: ${goal}\nBudget: \u20B9${budget}\nDiet: ${dietType}\nAvailable ingredients: ${ingredientNames}.\nProvide output JSON with keys: breakfast, lunch, dinner, totalCost, totalCalories. Each meal should include name, calories, cost, and optionally protein.\n`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });
    const text = response.choices[0].message.content;
    return JSON.parse(text);
  } catch (err) {
    // Fallback simple meal plan using selected ingredients
    const fallbackPlan = {
      breakfast: selected[0] ? { name: selected[0].name, calories: selected[0].calories, cost: selected[0].cost_per_serving, protein: selected[0].protein } : {},
      lunch: selected[1] ? { name: selected[1].name, calories: selected[1].calories, cost: selected[1].cost_per_serving, protein: selected[1].protein } : {},
      dinner: selected[2] ? { name: selected[2].name, calories: selected[2].calories, cost: selected[2].cost_per_serving, protein: selected[2].protein } : {}
    };
    fallbackPlan.totalCalories = (fallbackPlan.breakfast.calories || 0) + (fallbackPlan.lunch.calories || 0) + (fallbackPlan.dinner.calories || 0);
    fallbackPlan.totalCost = (fallbackPlan.breakfast.cost || 0) + (fallbackPlan.lunch.cost || 0) + (fallbackPlan.dinner.cost || 0);
    return fallbackPlan;
  }
}

async function nutritionSummary(mealPlan) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCost = 0;
  ['breakfast', 'lunch', 'dinner'].forEach(meal => {
    const item = mealPlan[meal];
    if (item) {
      totalCalories += item.calories || 0;
      totalProtein += item.protein || 0;
      totalCost += item.cost || 0;
    }
  });
  return { totalCalories, totalProtein, totalCost };
}

module.exports = { generateMealPlan, nutritionSummary };
