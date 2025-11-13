import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface CSVRow {
  Item: string;
  Calories_kcal_per100g: string;
  Protein_g: string;
  Carbs_g: string;
  Fat_g: string;
  Fiber_g?: string;
  Calcium_mg?: string;
  Iron_mg?: string;
  VitaminC_mg?: string;
  Price_INR_per_kg: string;
}

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.replace(/"/g, "").trim());
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row as CSVRow;
  });
}

function categorizeIngredient(name: string): string {
  const lower = name.toLowerCase();
  
  if (lower.includes("rice") || lower.includes("wheat") || lower.includes("flour") || 
      lower.includes("poha") || lower.includes("ragi") || lower.includes("jowar") || 
      lower.includes("bajra") || lower.includes("sattu") || lower.includes("oats")) {
    return "Grains";
  }
  
  if (lower.includes("dal") || lower.includes("chana") || lower.includes("rajma") || 
      lower.includes("lentil") || lower.includes("bean") || lower.includes("soybean")) {
    return "Pulses";
  }
  
  if (lower.includes("chicken") || lower.includes("fish") || lower.includes("egg") || 
      lower.includes("meat") || lower.includes("mutton") || lower.includes("prawn")) {
    return "Proteins";
  }
  
  if (lower.includes("milk") || lower.includes("curd") || lower.includes("paneer") || 
      lower.includes("cheese") || lower.includes("ghee") || lower.includes("butter")) {
    return "Dairy";
  }
  
  if (lower.includes("vegetable") || lower.includes("onion") || lower.includes("tomato") || 
      lower.includes("potato") || lower.includes("carrot") || lower.includes("cabbage") ||
      lower.includes("spinach") || lower.includes("cauliflower") || lower.includes("pepper")) {
    return "Vegetables";
  }
  
  if (lower.includes("fruit") || lower.includes("banana") || lower.includes("apple") || 
      lower.includes("mango") || lower.includes("orange") || lower.includes("pomegranate")) {
    return "Fruits";
  }
  
  if (lower.includes("oil") || lower.includes("mustard") || lower.includes("coconut")) {
    return "Fats & Oils";
  }
  
  if (lower.includes("spice") || lower.includes("turmeric") || lower.includes("cumin") || 
      lower.includes("coriander") || lower.includes("chili")) {
    return "Spices";
  }
  
  if (lower.includes("nut") || lower.includes("almond") || lower.includes("cashew") || 
      lower.includes("peanut") || lower.includes("walnut")) {
    return "Nuts & Seeds";
  }
  
  return "Other";
}

async function seedIngredients() {
  console.log("Seeding ingredients...");
  
  const csvPath = path.join(process.cwd(), "dataset", "Indian_Global_Foods_Nutrition_Prices_100items.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.warn(`CSV file not found at ${csvPath}, skipping ingredient seeding`);
    return;
  }

  const rows = parseCSV(csvPath);
  let count = 0;

  for (const row of rows) {
    try {
      const name = row.Item.trim();
      if (!name) continue;

      const calories = parseFloat(row.Calories_kcal_per100g) || 0;
      const protein = parseFloat(row.Protein_g) || 0;
      const carbs = parseFloat(row.Carbs_g) || 0;
      const fat = parseFloat(row.Fat_g) || 0;
      const pricePerKg = parseFloat(row.Price_INR_per_kg) || 0;

      // Convert price per kg to price per 100g (standard unit)
      const pricePer100g = pricePerKg / 10;

      const category = categorizeIngredient(name);

      await prisma.ingredient.upsert({
        where: { name },
        create: {
          name,
          category,
          unit: "g",
          caloriesPerUnit: calories,
          macrosPerUnit: {
            protein,
            carbs,
            fat,
          },
          defaultPrice: pricePer100g,
        },
        update: {
          caloriesPerUnit: calories,
          macrosPerUnit: {
            protein,
            carbs,
            fat,
          },
          defaultPrice: pricePer100g,
          category,
        },
      });

      count++;
    } catch (error) {
      console.error(`Error seeding ingredient ${row.Item}:`, error);
    }
  }

  console.log(`Seeded ${count} ingredients`);
}

async function seedRecipes() {
  console.log("Seeding sample recipes...");

  const sampleRecipes = [
    {
      name: "Paneer Tikka Bowl",
      description: "Grilled paneer with bell peppers and onions, served with brown rice",
      cuisine: "Indian",
      tags: ["vegetarian", "high-protein", "gluten-free"],
      calories: 420,
      servings: 1,
      totalTime: 30,
      macroBreakdown: { protein: 25, carbs: 45, fat: 12 },
      ingredients: [
        { name: "Paneer", quantity: 100 },
        { name: "Bell Peppers", quantity: 50 },
        { name: "Onions", quantity: 50 },
        { name: "Brown Rice", quantity: 100 },
      ],
    },
    {
      name: "Tandoori Chicken & Dal",
      description: "Spiced grilled chicken with yellow dal and roti",
      cuisine: "Indian",
      tags: ["non-vegetarian", "high-protein"],
      calories: 380,
      servings: 1,
      totalTime: 45,
      macroBreakdown: { protein: 35, carbs: 30, fat: 15 },
      ingredients: [
        { name: "Chicken Breast", quantity: 150 },
        { name: "Yellow Dal", quantity: 100 },
        { name: "Wheat Flour", quantity: 50 },
      ],
    },
    {
      name: "Masala Oats & Fruits",
      description: "Spiced oats with fresh fruits and nuts",
      cuisine: "Indian",
      tags: ["vegetarian", "breakfast", "high-fiber"],
      calories: 320,
      servings: 1,
      totalTime: 15,
      macroBreakdown: { protein: 12, carbs: 55, fat: 8 },
      ingredients: [
        { name: "Oats", quantity: 50 },
        { name: "Banana", quantity: 100 },
        { name: "Milk", quantity: 200 },
        { name: "Almonds", quantity: 20 },
      ],
    },
    {
      name: "Sprouts Salad",
      description: "Fresh mixed sprouts with vegetables and lemon",
      cuisine: "Indian",
      tags: ["vegetarian", "vegan", "low-calorie", "high-protein"],
      calories: 280,
      servings: 1,
      totalTime: 10,
      macroBreakdown: { protein: 18, carbs: 40, fat: 5 },
      ingredients: [
        { name: "Mixed Sprouts", quantity: 150 },
        { name: "Cucumber", quantity: 50 },
        { name: "Tomatoes", quantity: 50 },
      ],
    },
    {
      name: "Fish Curry & Rice",
      description: "Traditional fish curry with steamed rice",
      cuisine: "Indian",
      tags: ["non-vegetarian", "high-protein", "omega-3"],
      calories: 450,
      servings: 1,
      totalTime: 40,
      macroBreakdown: { protein: 30, carbs: 50, fat: 12 },
      ingredients: [
        { name: "Fish", quantity: 150 },
        { name: "Rice, white (raw)", quantity: 100 },
        { name: "Onions", quantity: 50 },
        { name: "Tomatoes", quantity: 50 },
      ],
    },
    {
      name: "Fruit & Nut Smoothie",
      description: "Blended fruits with nuts and milk",
      cuisine: "International",
      tags: ["vegetarian", "breakfast", "smoothie"],
      calories: 350,
      servings: 1,
      totalTime: 5,
      macroBreakdown: { protein: 10, carbs: 60, fat: 10 },
      ingredients: [
        { name: "Mango", quantity: 100 },
        { name: "Banana", quantity: 100 },
        { name: "Milk", quantity: 200 },
        { name: "Almonds", quantity: 20 },
      ],
    },
  ];

  let count = 0;

  for (const recipeData of sampleRecipes) {
    try {
      // Find or create ingredients
      const recipeIngredients = [];
      for (const ing of recipeData.ingredients) {
        const ingredient = await prisma.ingredient.findFirst({
          where: {
            name: {
              contains: ing.name,
              mode: "insensitive",
            },
          },
        });

        if (ingredient) {
          recipeIngredients.push({
            ingredientId: ingredient.id,
            quantity: ing.quantity,
          });
        }
      }

      if (recipeIngredients.length === 0) {
        console.warn(`Skipping recipe ${recipeData.name} - no ingredients found`);
        continue;
      }

      const recipe = await prisma.recipe.upsert({
        where: { name: recipeData.name },
        create: {
          name: recipeData.name,
          description: recipeData.description,
          cuisine: recipeData.cuisine,
          tags: recipeData.tags,
          calories: recipeData.calories,
          servings: recipeData.servings,
          totalTime: recipeData.totalTime,
          macroBreakdown: recipeData.macroBreakdown,
          ingredients: {
            create: recipeIngredients,
          },
        },
        update: {
          description: recipeData.description,
          calories: recipeData.calories,
          macroBreakdown: recipeData.macroBreakdown,
        },
      });

      count++;
    } catch (error) {
      console.error(`Error seeding recipe ${recipeData.name}:`, error);
    }
  }

  console.log(`Seeded ${count} recipes`);
}

async function main() {
  console.log("Starting database seeding...");

  try {
    await seedIngredients();
    await seedRecipes();
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

