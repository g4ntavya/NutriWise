import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} />

      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-6 text-foreground">Your Profile</h1>
          <p className="text-muted-foreground">Demo profile page for NutriWise dashboard.</p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-card p-6 rounded-2xl border-border">Account details</div>
            <div className="bg-card p-6 rounded-2xl border-border">Preferences</div>
            <div className="bg-card p-6 rounded-2xl border-border">Subscription</div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
