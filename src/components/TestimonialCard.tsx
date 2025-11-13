import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
}

const TestimonialCard = ({ name, role, content, rating, initials }: TestimonialCardProps) => {
  return (
    <Card className="p-6 bg-card border-border rounded-2xl hover:shadow-lg transition-shadow">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-foreground mb-4 italic">"{content}"</p>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;
