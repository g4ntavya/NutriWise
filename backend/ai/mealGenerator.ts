import { OpenAI } from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function generateMealPlan(
  budget: number,
  goal: string,
  dietType: string
) {
  const ingredients = JSON.parse(
    fs.readFileSync("data/ingredients_india.json", "utf8")
  );

  const prompt = `
You are NutriWise AI. Generate a healthy Indian meal plan.

Inputs:
- Budget: ₹${budget}
- Goal: ${goal}
- Diet Type: ${dietType}

Available ingredients (with price + calories):
${JSON.stringify(ingredients)}

Rules:
1. Total day cost must NOT exceed the given budget.
2. Meals must be Indian, simple, affordable.
3. Output strictly in JSON with:
{
  "totalCost": number,
  "meals": [
    {
      "name": "...",
      "ingredients": [{ "item": "...", "quantity": "...", "cost": number }],
      "calories": number,
      "protein": number
    }
  ]
}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4
  });

  const text = response.choices[0].message?.content || "{}";
  return JSON.parse(text);
}
