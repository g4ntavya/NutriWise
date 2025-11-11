import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Target, Users, Sparkles, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              About <span className="text-primary">NutriWise</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe everyone deserves access to healthy, affordable meals. Our AI-powered platform makes it possible.
            </p>
          </div>

          <Card className="p-8 md:p-12 mb-12 bg-card border-border rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Our Vision</h2>
            <p className="text-lg text-muted-foreground mb-6">
              NutriWise was born from a simple observation: eating healthy shouldn't mean breaking the bank. We noticed that many people struggle to balance nutrition with their budget, often sacrificing one for the other.
            </p>
            <p className="text-lg text-muted-foreground">
              Using advanced AI technology, we've created a solution that understands your unique needs, dietary preferences, and financial constraints to deliver personalized meal plans that work for you.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-8 bg-card border-border rounded-2xl">
              <Target className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-foreground">Our Mission</h3>
              <p className="text-muted-foreground">
                To democratize healthy eating by making nutritious meal planning accessible and affordable for everyone, regardless of their budget.
              </p>
            </Card>
            <Card className="p-8 bg-card border-border rounded-2xl">
              <Users className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-foreground">Our Community</h3>
              <p className="text-muted-foreground">
                Join thousands of users who have transformed their eating habits while saving money and improving their health.
              </p>
            </Card>
            <Card className="p-8 bg-card border-border rounded-2xl">
              <Sparkles className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-foreground">AI Technology</h3>
              <p className="text-muted-foreground">
                Our cutting-edge AI analyzes nutritional data, pricing, and your preferences to create optimal meal plans.
              </p>
            </Card>
            <Card className="p-8 bg-card border-border rounded-2xl">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-foreground">Ethical Approach</h3>
              <p className="text-muted-foreground">
                We prioritize your health, privacy, and financial well-being above all else. No hidden costs, no compromises.
              </p>
            </Card>
          </div>

          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Why Choose NutriWise?</h2>
            <div className="space-y-4 text-lg">
              <p className="text-muted-foreground">
                ✓ Personalized meal plans that adapt to your changing needs
              </p>
              <p className="text-muted-foreground">
                ✓ Real-time budget tracking and optimization
              </p>
              <p className="text-muted-foreground">
                ✓ Nutritionally balanced meals verified by experts
              </p>
              <p className="text-muted-foreground">
                ✓ Flexible dietary preferences (vegan, keto, allergies, etc.)
              </p>
              <p className="text-muted-foreground">
                ✓ Shopping list generation and ingredient sourcing
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
