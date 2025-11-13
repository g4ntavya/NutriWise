"""
Seed Supabase database with ingredients and recipes from CSV files
"""
import os
import sys
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

def categorize_ingredient(name: str) -> str:
    """Categorize ingredient based on name"""
    lower = name.lower()
    
    if any(x in lower for x in ["rice", "wheat", "flour", "poha", "ragi", "jowar", "bajra", "sattu", "oats"]):
        return "Grains"
    if any(x in lower for x in ["dal", "chana", "rajma", "lentil", "bean", "soybean"]):
        return "Pulses"
    if any(x in lower for x in ["chicken", "fish", "egg", "meat", "mutton", "prawn"]):
        return "Proteins"
    if any(x in lower for x in ["milk", "curd", "paneer", "cheese", "ghee", "butter"]):
        return "Dairy"
    if any(x in lower for x in ["vegetable", "onion", "tomato", "potato", "carrot", "cabbage", "spinach"]):
        return "Vegetables"
    if any(x in lower for x in ["fruit", "banana", "apple", "mango", "orange", "pomegranate"]):
        return "Fruits"
    if any(x in lower for x in ["oil", "mustard", "coconut"]):
        return "Fats & Oils"
    if any(x in lower for x in ["spice", "turmeric", "cumin", "coriander", "chili"]):
        return "Spices"
    if any(x in lower for x in ["nut", "almond", "cashew", "peanut", "walnut"]):
        return "Nuts & Seeds"
    
    return "Other"

def seed_ingredients():
    """Seed ingredients from CSV"""
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )
    
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset", "Indian_Global_Foods_Nutrition_Prices_100items.csv")
    
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return
    
    df = pd.read_csv(csv_path)
    count = 0
    
    for _, row in df.iterrows():
        try:
            name = str(row["Item"]).strip()
            if not name or name == "nan":
                continue
            
            ingredient = {
                "name": name,
                "category": categorize_ingredient(name),
                "unit": "g",
                "calories_per_unit": float(row["Calories_kcal_per100g"]) if pd.notna(row["Calories_kcal_per100g"]) else 0,
                "macros_per_unit": {
                    "protein": float(row["Protein_g"]) if pd.notna(row["Protein_g"]) else 0,
                    "carbs": float(row["Carbs_g"]) if pd.notna(row["Carbs_g"]) else 0,
                    "fat": float(row["Fat_g"]) if pd.notna(row["Fat_g"]) else 0
                },
                "default_price": float(row["Price_INR_per_kg"]) / 10 if pd.notna(row["Price_INR_per_kg"]) else 0
            }
            
            # Upsert (insert or update)
            supabase.table("ingredients").upsert(ingredient, on_conflict="name").execute()
            count += 1
            
        except Exception as e:
            print(f"Error seeding ingredient {row.get('Item', 'Unknown')}: {e}")
    
    print(f"✅ Seeded {count} ingredients")

if __name__ == "__main__":
    print("🌱 Seeding Supabase database...")
    seed_ingredients()
    print("✅ Seeding complete!")

