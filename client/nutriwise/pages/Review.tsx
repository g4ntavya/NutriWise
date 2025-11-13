import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MealCard from "@/components/MealCard";
import { apiClient } from "@/lib/api";
import { RefreshCw, Save, ShoppingCart, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { MealPlan } from "@shared/api";

const Review = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (id) {
      loadMealPlan(id);
    }
  }, [id]);

  const loadMealPlan = async (mealPlanId: string) => {
    try {
      setLoading(true);
      const data = await apiClient.getMealPlan(mealPlanId);
      setMealPlan(data);
    } catch (error: any) {
      alert(`Error loading meal plan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!id || !mealPlan) return;
    setRegenerating(true);
    try {
      const data = await apiClient.regenerateMealPlan(id, {
        budget: mealPlan.budget || 2500,
        calorieTarget: mealPlan.calorie_target || 2000,
        dietaryPreferences: mealPlan.meal_plan_data?.dietary_preferences || [],
        healthGoals: mealPlan.meal_plan_data?.health_goals || [],
        durationDays: mealPlan.duration_days || 7,
      });
      setMealPlan(data);
    } catch (error: any) {
      alert(`Error regenerating: ${error.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  const handleGetGroceryList = async () => {
    if (!id) return;
    try {
      const groceryList = await apiClient.getGroceryList(id);
      console.log("Grocery List:", groceryList);
      // You can show this in a modal or navigate to a grocery list page
      alert(`Grocery list has ${groceryList.items?.length || 0} items. Total cost: ₹${groceryList.totalCost?.toFixed(2) || 0}`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLoginClick={() => {}} />
        <div className="pt-32 pb-20 px-4 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Meal Plan Not Found</h1>
          <Button onClick={() => navigate("/app/meal-plan")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const mealPlanData = mealPlan.meal_plan_data || mealPlan;
  const validation = mealPlan.validation || {};
  const days = mealPlanData.days || [];
  const totalCost = mealPlanData.totalCost || mealPlan.total_cost || 0;
  const avgCalories = mealPlanData.averageDailyCalories || mealPlan.calorie_target || 0;

  // Flatten all meals for display
  const allMeals = days.flatMap((day: any) =>
    (day.meals || []).map((meal: any) => ({
      ...meal,
      dayIndex: day.dayIndex,
      dayName: `Day ${day.dayIndex + 1}`,
    }))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} />
      
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-foreground">
                Your <span className="text-primary">Meal Plan</span> Review
              </h1>
              <p className="text-xl text-muted-foreground">
                {mealPlan.title || `${mealPlan.duration_days || 7} days of personalized meals`}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="rounded-full gap-2"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate Plan
              </Button>
              <Button variant="secondary" className="rounded-full gap-2">
                <Save className="h-4 w-4" />
                Save Plan
              </Button>
              <Button className="rounded-full gap-2" onClick={handleGetGroceryList}>
                <ShoppingCart className="h-4 w-4" />
                Grocery List
              </Button>
            </div>
          </div>

          {/* Validation Status */}
          {validation.nutrition || validation.pricing ? (
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {validation.nutrition && (
                <Card className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    Nutrition Validation
                    {validation.nutrition.overall_valid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </h3>
                  {validation.nutrition.daily_validations?.map((day: any, idx: number) => (
                    <div key={idx} className="text-sm mb-2">
                      <p>Day {idx + 1}: {day.overall_valid ? "✅ Valid" : "❌ Needs adjustment"}</p>
                    </div>
                  ))}
                </Card>
              )}
              {validation.pricing && (
                <Card className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    Budget Validation
                    {validation.pricing.within_budget ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>Total Cost: ₹{validation.pricing.cost_analysis?.total_cost?.toFixed(2) || 0}</p>
                    <p>Budget: ₹{validation.pricing.budget_validation?.budget?.toFixed(2) || 0}</p>
                    <p>Utilization: {validation.pricing.budget_validation?.budget_utilization_percent?.toFixed(1) || 0}%</p>
                  </div>
                </Card>
              )}
            </div>
          ) : null}

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-primary">₹{totalCost.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground mt-1">for {mealPlan.duration_days || 7} days</p>
            </div>
            <div className="bg-secondary/10 rounded-2xl p-6 border border-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Avg Calories</p>
              <p className="text-3xl font-bold text-secondary">{Math.round(avgCalories)}</p>
              <p className="text-sm text-muted-foreground mt-1">per day</p>
            </div>
            <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Total Meals</p>
              <p className="text-3xl font-bold text-accent">{allMeals.length}</p>
              <p className="text-sm text-muted-foreground mt-1">across {days.length} days</p>
            </div>
          </div>

          {/* Days Section */}
          {days.length > 0 ? (
            <div className="space-y-8 mb-8">
              <h2 className="text-3xl font-bold">Meal Plan Breakdown</h2>
              {days.map((day: any, dayIdx: number) => (
                <Card key={dayIdx} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Day {day.dayIndex + 1}</h3>
                    <div className="flex gap-4 text-sm">
                      <Badge variant="secondary">
                        {day.totalCalories?.toFixed(0) || 0} cal
                      </Badge>
                      <Badge variant="outline">
                        ₹{day.totalCost?.toFixed(0) || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(day.meals || []).map((meal: any, mealIdx: number) => (
                      <div key={mealIdx} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{meal.mealType}</Badge>
                          <span className="text-sm font-medium">{meal.dayName}</span>
                        </div>
                        <h4 className="font-bold text-lg mb-2">{meal.name}</h4>
                        {meal.ingredients && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {meal.ingredients.slice(0, 3).join(", ")}
                            {meal.ingredients.length > 3 && "..."}
                          </p>
                        )}
                        <div className="flex gap-2 text-sm">
                          <Badge variant="secondary">
                            {meal.estimatedCalories?.toFixed(0) || meal.calories || 0} cal
                          </Badge>
                          <Badge>
                            ₹{meal.estimatedCost?.toFixed(0) || meal.cost || 0}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Fallback: Show all meals in grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allMeals.map((meal: any, index: number) => (
                <MealCard
                  key={index}
                  image="https://images.unsplash.com/photo-1543352634-46b4609f1b7b?w=800&q=60&auto=format&fit=crop"
                  name={meal.name}
                  ingredients={meal.ingredients || []}
                  calories={meal.estimatedCalories || meal.calories || 0}
                  cost={meal.estimatedCost || meal.cost || 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Review;

