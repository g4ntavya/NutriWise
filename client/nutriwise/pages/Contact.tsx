import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} />

      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Contact Us</h1>
          <p className="text-muted-foreground">Reach out at hello@nutriwise.in and we'll get back to you.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
