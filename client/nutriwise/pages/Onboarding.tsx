import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    weight_kg: "",
    height_cm: "",
    activity_level: "",
    dietary_goal: "",
    target_weight_kg: "",
    timeline_weeks: "",
    dietary_preferences: [] as string[],
    allergies: [] as string[],
    preferred_cuisines: [] as string[],
    weekly_budget_inr: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [field]: [...current, value] };
      } else {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ...formData,
        age: parseInt(formData.age),
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
        target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : undefined,
        timeline_weeks: formData.timeline_weeks ? parseInt(formData.timeline_weeks) : undefined,
        weekly_budget_inr: formData.weekly_budget_inr ? parseFloat(formData.weekly_budget_inr) : undefined,
      };

      await apiClient.completeOnboarding(data);
      navigate("/app/meal-plan");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} />
      
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              Let's Create Your <span className="text-primary">Personalized</span> Profile
            </h1>
            <p className="text-xl text-muted-foreground">
              Step {step} of 3: Tell us about yourself
            </p>
          </div>

          <Card className="p-8 md:p-12 bg-card border-border rounded-3xl shadow-lg">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Age</label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Gender</label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
                    <Input
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange("weight_kg", e.target.value)}
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Height (cm)</label>
                    <Input
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => handleInputChange("height_cm", e.target.value)}
                      placeholder="170"
                    />
                  </div>
                </div>
                <Button onClick={() => setStep(2)} className="w-full" size="lg">
                  Next
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Activity & Goals</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Activity Level</label>
                    <Select value={formData.activity_level} onValueChange={(v) => handleInputChange("activity_level", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEDENTARY">Sedentary (Little/no exercise)</SelectItem>
                        <SelectItem value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</SelectItem>
                        <SelectItem value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</SelectItem>
                        <SelectItem value="VERY_ACTIVE">Very Active (6-7 days/week)</SelectItem>
                        <SelectItem value="EXTRA_ACTIVE">Extra Active (Very hard exercise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Dietary Goal</label>
                    <Select value={formData.dietary_goal} onValueChange={(v) => handleInputChange("dietary_goal", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOSE_WEIGHT">Lose Weight</SelectItem>
                        <SelectItem value="MAINTAIN_WEIGHT">Maintain Weight</SelectItem>
                        <SelectItem value="GAIN_WEIGHT">Gain Weight</SelectItem>
                        <SelectItem value="BUILD_MUSCLE">Build Muscle</SelectItem>
                        <SelectItem value="IMPROVE_ENERGY">Improve Energy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Target Weight (kg) - Optional</label>
                      <Input
                        type="number"
                        value={formData.target_weight_kg}
                        onChange={(e) => handleInputChange("target_weight_kg", e.target.value)}
                        placeholder="65"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Timeline (weeks) - Optional</label>
                      <Input
                        type="number"
                        value={formData.timeline_weeks}
                        onChange={(e) => handleInputChange("timeline_weeks", e.target.value)}
                        placeholder="8"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Preferences & Budget</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Dietary Preferences</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["VEGETARIAN", "VEGAN", "NON_VEGETARIAN", "GLUTEN_FREE", "DAIRY_FREE", "KETO"].map((pref) => (
                        <div key={pref} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.dietary_preferences.includes(pref)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("dietary_preferences", pref, checked as boolean)
                            }
                          />
                          <label className="text-sm">{pref.replace("_", " ")}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Allergies (comma-separated)</label>
                    <Input
                      value={formData.allergies.join(", ")}
                      onChange={(e) => handleInputChange("allergies", e.target.value.split(",").map((s) => s.trim()))}
                      placeholder="Nuts, Shellfish, Dairy"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preferred Cuisines (comma-separated)</label>
                    <Input
                      value={formData.preferred_cuisines.join(", ")}
                      onChange={(e) => handleInputChange("preferred_cuisines", e.target.value.split(",").map((s) => s.trim()))}
                      placeholder="Indian, Italian, Chinese"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Weekly Budget (₹)</label>
                    <Input
                      type="number"
                      value={formData.weekly_budget_inr}
                      onChange={(e) => handleInputChange("weekly_budget_inr", e.target.value)}
                      placeholder="2500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1" disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Onboarding;

