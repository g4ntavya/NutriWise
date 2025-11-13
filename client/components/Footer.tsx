import { Link } from "react-router-dom";
import { Salad, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary rounded-full p-2">
                <Salad className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">NutriWise</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              AI-powered meal planning that fits your budget and helps you stay healthy.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/app/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/app/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/app/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/app/budget" className="hover:text-primary transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@nutriwise.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 NutriWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
