import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, DollarSign, TrendingUp, Award } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-32 pb-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <Card className="p-8 mb-8 bg-card border-border rounded-3xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2 text-foreground">John Doe</h1>
                <p className="text-muted-foreground mb-4">john.doe@email.com</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button variant="outline" className="rounded-full">
                    Edit Profile
                  </Button>
                  <Button className="rounded-full">
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 rounded-2xl">
              <TabsTrigger value="plans" className="rounded-xl">My Saved Plans</TabsTrigger>
              <TabsTrigger value="budget" className="rounded-xl">Budget History</TabsTrigger>
              <TabsTrigger value="progress" className="rounded-xl">Health Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Saved Meal Plans</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((plan) => (
                  <Card key={plan} className="p-6 bg-card border-border rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">Plan #{plan}</h3>
                        <p className="text-sm text-muted-foreground">Created 2 weeks ago</p>
                      </div>
                      <div className="flex items-center gap-1 text-accent">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-semibold">7 days</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-bold text-primary">₹12,000/week</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Calories</p>
                        <p className="font-bold text-secondary">2,100/day</p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-full">
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Budget History</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="p-6 bg-primary/10 border-primary/20 rounded-2xl">
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-primary">₹11,600</p>
                </Card>
                <Card className="p-6 bg-secondary/10 border-secondary/20 rounded-2xl">
                  <TrendingUp className="h-8 w-8 text-secondary mb-2" />
                  <p className="text-sm text-muted-foreground">Monthly Avg</p>
                  <p className="text-2xl font-bold text-secondary">₹46,400</p>
                </Card>
                <Card className="p-6 bg-accent/10 border-accent/20 rounded-2xl">
                  <Award className="h-8 w-8 text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Savings</p>
                  <p className="text-2xl font-bold text-accent">₹9,600</p>
                </Card>
              </div>
              <Card className="p-6 bg-card border-border rounded-2xl">
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Budget chart visualization would go here
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Health Progress Tracker</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 bg-card border-border rounded-2xl">
                  <h3 className="font-bold mb-4 text-foreground">Weight Trend</h3>
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Weight chart would go here
                  </div>
                </Card>
                <Card className="p-6 bg-card border-border rounded-2xl">
                  <h3 className="font-bold mb-4 text-foreground">Nutrition Score</h3>
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Nutrition score chart would go here
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
