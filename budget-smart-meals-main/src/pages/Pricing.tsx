import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: 0,
      period: "forever",
      features: [
        "3 meal plans per month",
        "Basic nutrition tracking",
        "Standard recipes",
        "Community support",
        "Mobile app access"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      price: 799,
      period: "month",
      features: [
        "Unlimited meal plans",
        "Advanced nutrition tracking",
        "Premium recipes",
        "Priority support",
        "Shopping list integration",
        "Custom dietary preferences",
        "Export & print options"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Family",
      price: 1599,
      period: "month",
      features: [
        "Everything in Pro",
        "Up to 5 family members",
        "Family meal planning",
        "Bulk shopping lists",
        "Shared nutrition dashboard",
        "Family health tracking",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Simple, <span className="text-primary">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include our core AI meal planning features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`p-8 bg-card border-border rounded-3xl transition-all duration-300 hover:shadow-xl ${
                  plan.highlighted 
                    ? 'border-primary border-2 shadow-lg scale-105' 
                    : 'hover:-translate-y-1'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-primary text-primary-foreground text-sm font-semibold py-1 px-4 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-primary">₹{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full rounded-full h-12 ${
                    plan.highlighted ? '' : 'bg-secondary'
                  }`}
                  variant={plan.highlighted ? 'default' : 'secondary'}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-8 md:p-12 bg-muted/50 border-border rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Can I change plans anytime?</h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  Pro and Family plans come with a 14-day free trial. No credit card required to start.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-foreground">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and Apple Pay for your convenience.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Can I get a refund?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
