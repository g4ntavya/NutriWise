import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";
import TestimonialCard from "../components/TestimonialCard";
import { Wallet, Sparkles, ChefHat, TrendingUp, Heart, Shield } from "lucide-react";
import heroImage from "../assets/hero-meals.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Plan Smart. Eat Better.{" "}
                <span className="text-primary">Stay on Budget</span> with NutriWise.
              </h1>
              <p className="text-xl text-muted-foreground">
                AI that designs your perfect meal plan—based on your goals, diet, and budget.
              </p>
              
              <div className="space-y-4">
                <Select>
                  <SelectTrigger className="w-full h-14 text-lg rounded-2xl">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight</SelectItem>
                    <SelectItem value="gain">Gain Muscle</SelectItem>
                    <SelectItem value="maintain">Maintain Health</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/budget" className="flex-1">
                    <Button size="lg" className="w-full rounded-full h-14 text-lg">
                      Set My Budget
                    </Button>
                  </Link>
                  <Link to="/meal-plan" className="flex-1">
                    <Button size="lg" variant="outline" className="w-full rounded-full h-14 text-lg">
                      Generate My Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <img 
                src={heroImage} 
                alt="Healthy meals" 
                className="relative rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your eating habits
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Wallet}
              title="Set Your Budget"
              description="Decide how much you want to spend weekly on meals"
              step="Step 1"
            />
            <FeatureCard 
              icon={Heart}
              title="Choose Preferences"
              description="Select your diet and fitness goals"
              step="Step 2"
            />
            <FeatureCard 
              icon={Sparkles}
              title="AI Generates Meals"
              description="Get a personalized plan within your budget"
              step="Step 3"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Why Choose NutriWise?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Smart meal planning powered by AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ChefHat}
              title="Personalized Plans"
              description="Meal plans tailored to your dietary needs and preferences"
            />
            <FeatureCard 
              icon={TrendingUp}
              title="Budget Tracking"
              description="Stay within your budget while eating healthy"
            />
            <FeatureCard 
              icon={Shield}
              title="Nutrition Quality"
              description="Ensure you're getting the right nutrients"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Real stories from real people</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Sarah Johnson"
              role="Fitness Enthusiast"
              content="NutriWise helped me save $200 a month while eating healthier than ever!"
              rating={5}
              initials="SJ"
            />
            <TestimonialCard 
              name="Mike Chen"
              role="Busy Professional"
              content="The AI meal plans are perfect for my tight schedule and budget."
              rating={5}
              initials="MC"
            />
            <TestimonialCard 
              name="Emma Davis"
              role="College Student"
              content="Finally, healthy eating that doesn't break the bank. Love it!"
              rating={5}
              initials="ED"
            />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Start Your Healthy Journey Today
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Stay fit and financially smart with NutriWise
            </p>
            <Link to="/budget">
              <Button size="lg" variant="secondary" className="rounded-full h-14 px-8 text-lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
