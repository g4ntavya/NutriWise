import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} />

      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-6 text-foreground">Pricing</h1>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">Free</Card>
            <Card className="p-6">Pro</Card>
            <Card className="p-6">Enterprise</Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
