import OpenAI from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

const ingredientsPath = path.resolve("backend/data/ingredients_india.json");
const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, "utf-8"));

export async function generateMealPlan(budget: number, goal: string, dietType: string) {
  const suitable = ingredients.filter((i: any) => i.diet.includes(dietType));

  const dailyBudget = budget / 3;
  const selectedMeals = suitable
    .filter((i: any) => i.cost_per_serving <= dailyBudget)
    .slice(0, 3);

  const prompt = `You are NutriWise, an AI meal planner.
Create a 1-day meal plan (breakfast, lunch, dinner) for:
Goal: ${goal}
Budget: ₹${budget}
Diet: ${dietType}
Available ingredients: ${selectedMeals.map((i: any) => i.name).join(", ")}.
Output JSON like:
{
  "breakfast": {...},
  "lunch": {...},
  "dinner": {...},
  "totalCost": 0,
  "totalCalories": 0
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = response.choices[0].message?.content || "{}";
  const plan = JSON.parse(text);
  return plan;
}

export async function nutritionSummary(mealPlan: any) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCost = 0;

  for (const meal of Object.values(mealPlan)) {
    totalCalories += (meal as any).calories || 0;
    totalProtein += (meal as any).protein || 0;
    totalCost += (meal as any).cost || 0;
  }

  return {
    totalCalories,
    totalProtein,
    totalCost,
    message: `Total ${totalCalories} kcal, ${totalProtein}g protein at ₹${totalCost}`,
  };
}
