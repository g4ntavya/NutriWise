import { Button } from "../components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MealCard from "../components/MealCard";
import { RefreshCw, Save, ShoppingCart } from "lucide-react";
import meal1 from "../assets/meal-1.jpg";
import meal2 from "../assets/meal-2.jpg";
import meal3 from "../assets/meal-3.jpg";

const MealPlan = () => {
  const meals = [
    {
      image: meal1,
      name: "Paneer Tikka Bowl",
      ingredients: ["Paneer", "Bell Peppers", "Onions", "Mint Chutney", "Brown Rice"],
      calories: 420,
      cost: 150
    },
    {
      image: meal2,
      name: "Tandoori Chicken & Dal",
      ingredients: ["Chicken Breast", "Yellow Dal", "Roti", "Mixed Vegetables"],
      calories: 380,
      cost: 180
    },
    {
      image: meal3,
      name: "Masala Oats & Fruits",
      ingredients: ["Oats", "Banana", "Pomegranate", "Almonds", "Honey"],
      calories: 320,
      cost: 100
    },
    {
      image: meal1,
      name: "Sprouts Salad",
      ingredients: ["Mixed Sprouts", "Cucumber", "Tomatoes", "Lemon", "Coriander"],
      calories: 280,
      cost: 80
    },
    {
      image: meal2,
      name: "Fish Curry & Rice",
      ingredients: ["Fish", "Curry Sauce", "Steamed Rice", "Vegetables"],
      calories: 450,
      cost: 220
    },
    {
      image: meal3,
      name: "Fruit & Nut Smoothie",
      ingredients: ["Mango", "Banana", "Almonds", "Milk", "Dates"],
      calories: 350,
      cost: 120
    }
  ];

  const totalCost = meals.reduce((sum, meal) => sum + meal.cost, 0);
  const avgCalories = Math.round(meals.reduce((sum, meal) => sum + meal.calories, 0) / meals.length);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-foreground">
                Your <span className="text-primary">Personalized</span> Meal Plan
              </h1>
              <p className="text-xl text-muted-foreground">
                6 delicious meals optimized for your budget and goals
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Regenerate Plan
              </Button>
              <Button variant="secondary" className="rounded-full gap-2">
                <Save className="h-4 w-4" />
                Save Plan
              </Button>
              <Button className="rounded-full gap-2">
                <ShoppingCart className="h-4 w-4" />
                Shop Ingredients
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-primary">₹{totalCost.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground mt-1">per day</p>
            </div>
            <div className="bg-secondary/10 rounded-2xl p-6 border border-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Avg Calories</p>
              <p className="text-3xl font-bold text-secondary">{avgCalories}</p>
              <p className="text-sm text-muted-foreground mt-1">per meal</p>
            </div>
            <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Nutrition Score</p>
              <p className="text-3xl font-bold text-accent">A+</p>
              <p className="text-sm text-muted-foreground mt-1">excellent balance</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal, index) => (
              <MealCard key={index} {...meal} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MealPlan;
