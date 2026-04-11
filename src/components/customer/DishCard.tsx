import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Star, Leaf } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface DishCardProps {
  dish: MenuItem;
  onViewDetails?: () => void;
}

const DishCard = ({ dish, onViewDetails }: DishCardProps) => {
  const { addItem } = useCart();

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {!dish.isAvailable && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="text-background font-medium px-4 py-2 bg-destructive rounded-lg">
              Not Available
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-sm flex items-center justify-center ${
              dish.isVeg ? 'bg-sage' : 'bg-destructive'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-background" />
          </span>
        </div>
        {dish.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 fill-gold text-gold" />
            <span className="text-xs font-medium">{dish.rating}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1">
          {dish.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {dish.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-primary">
            ₹{dish.price}
          </span>
          <Button
            variant="soft"
            size="sm"
            onClick={() => addItem(dish)}
            disabled={!dish.isAvailable}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
