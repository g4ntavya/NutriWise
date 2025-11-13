import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DollarSign, TrendingUp, Award } from "lucide-react";
import { apiClient } from "@/lib/api";

const Budget = () => {
  const [budget, setBudget] = useState([2500]);
  const navigate = useNavigate();

  const getNutritionQuality = (value: number) => {
    if (value < 1500) return { label: "Basic", color: "text-muted-foreground", icon: DollarSign };
    if (value < 3000) return { label: "Good", color: "text-primary", icon: TrendingUp };
    return { label: "Excellent", color: "text-secondary", icon: Award };
  };

  const quality = getNutritionQuality(budget[0]);
  const QualityIcon = quality.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} />
      
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              Set Your Weekly <span className="text-primary">Meal Budget</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Adjust the slider to match your budget and see the estimated nutrition quality
            </p>
          </div>

          <Card className="p-8 md:p-12 bg-card border-border rounded-3xl shadow-lg">
            <div className="space-y-8">
              <div className="text-center">
                <div className="text-7xl font-bold text-primary mb-2">
                  ₹{budget[0]}
                </div>
                <p className="text-muted-foreground">per week</p>
              </div>

              <div className="space-y-4">
                <Slider
                  value={budget}
                  onValueChange={setBudget}
                  max={5000}
                  min={500}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹500</span>
                  <span>₹5,000</span>
                </div>
              </div>

              <Card className="p-6 bg-accent-light border-accent/20 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-4 rounded-2xl">
                    <QualityIcon className={`h-8 w-8 ${quality.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Estimated Nutrition Quality
                    </p>
                    <p className={`text-2xl font-bold ${quality.color}`}>
                      {quality.label}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>💡 Higher budgets allow for:</p>
                <ul className="space-y-2 pl-6">
                  <li>• More variety in proteins and vegetables</li>
                  <li>• Organic and premium ingredients</li>
                  <li>• Better nutritional balance</li>
                  <li>• Specialty dietary options</li>
                </ul>
              </div>

              <Button 
                size="lg" 
                className="w-full rounded-full h-14 text-lg"
                onClick={async () => {
                  // Check if user has profile, if not redirect to onboarding
                  try {
                    await apiClient.getProfile();
                    navigate("/app/meal-plan");
                  } catch {
                    // No profile, go to onboarding first
                    navigate("/app/onboarding");
                  }
                }}
              >
                Generate My Meal Plan
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Budget;
