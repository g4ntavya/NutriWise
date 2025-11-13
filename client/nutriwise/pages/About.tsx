import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} />

      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-4 text-foreground">About NutriWise</h1>
          <p className="text-muted-foreground">NutriWise is an AI-powered meal planner focused on budget and local cuisine.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
