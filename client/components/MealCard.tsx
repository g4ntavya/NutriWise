import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MealCardProps {
  image: string;
  name: string;
  ingredients: string[];
  calories: number;
  cost: number;
}

const MealCard = ({ image, name, ingredients, calories, cost }: MealCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border rounded-2xl">
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {ingredients.join(", ")}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="rounded-full">
              {calories} cal
            </Badge>
            <Badge className="rounded-full bg-accent text-accent-foreground">
              ₹{cost.toFixed(0)}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MealCard;
