import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MealCard from "@/components/MealCard";
import { apiClient } from "@/lib/api";
import { RefreshCw, Save, ShoppingCart, Loader2, Sparkles } from "lucide-react";

const MealPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      setLoading(true);
      const plans = await apiClient.getMealPlans();
      setMealPlans(plans);
    } catch (error: any) {
      console.error("Error loading meal plans:", error);
      // If not authenticated, show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    try {
      setGenerating(true);
      // Get user profile to use for meal plan generation
      const profile = await apiClient.getProfile().catch(() => null);
      
      if (!profile) {
        navigate("/app/onboarding");
        return;
      }

      const nutritionConstraints = profile.nutrition_constraints || {};
      const budgetConstraints = profile.budget_constraints || {};

      const result = await apiClient.createMealPlan({
        budget: budgetConstraints.weekly_budget_inr || 2500,
        calorieTarget: nutritionConstraints.daily_calories || 2000,
        dietaryPreferences: nutritionConstraints.dietary_restrictions || [],
        healthGoals: profile.profile_data?.dietary_goal ? [profile.profile_data.dietary_goal] : ["MAINTAIN_HEALTH"],
        durationDays: 7,
      });

      if (result.meal_plan?.id) {
        navigate(`/app/review/${result.meal_plan.id}`);
      } else {
        alert("Meal plan generated! Check your meal plans.");
        loadMealPlans();
      }
    } catch (error: any) {
      if (error.message.includes("401") || error.message.includes("Authentication")) {
        alert("Please log in to generate meal plans");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} />
      
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-foreground">
                Your <span className="text-primary">Meal Plans</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                AI-powered personalized meal plans tailored to your goals
              </p>
            </div>
            
            <Button 
              className="rounded-full gap-2 h-14 px-6"
              onClick={handleGenerateNew}
              disabled={generating}
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate New Plan
                </>
              )}
            </Button>
          </div>

          {mealPlans.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">No Meal Plans Yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first AI-powered meal plan to get started!
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/app/onboarding")} variant="outline">
                  Complete Profile First
                </Button>
                <Button onClick={handleGenerateNew} disabled={generating}>
                  {generating ? "Generating..." : "Generate Meal Plan"}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.map((plan) => {
                const planData = plan.meal_plan_data || {};
                const totalCost = planData.totalCost || plan.total_cost || 0;
                const avgCalories = planData.averageDailyCalories || plan.calorie_target || 0;
                
                return (
                  <Card 
                    key={plan.id} 
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/app/review/${plan.id}`)}
                  >
                    <h3 className="text-xl font-bold mb-2">{plan.title || "Meal Plan"}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.duration_days || 7} days • Created {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-bold">₹{totalCost.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Calories:</span>
                        <span className="font-bold">{Math.round(avgCalories)}/day</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/review/${plan.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MealPlan;
