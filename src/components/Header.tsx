import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Salad } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary rounded-full p-2 group-hover:scale-110 transition-transform">
              <Salad className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">NutriWise</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="outline" className="rounded-full">
                Sign In
              </Button>
            </Link>
            <Link to="/budget">
              <Button className="rounded-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
