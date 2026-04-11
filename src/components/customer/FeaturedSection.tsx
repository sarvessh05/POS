import { useMenuItems } from '@/hooks/useDatabase';
import DishCard from './DishCard';
import { Loader2 } from 'lucide-react';

const FeaturedSection = () => {
  const { data: menuItems, isLoading } = useMenuItems();
  const featuredItems = menuItems?.filter((item) => item.rating && item.rating >= 4.5).slice(0, 4) || [];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Chef's Selection
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Most Popular Dishes
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Handpicked favorites that our guests absolutely love. Prepared with the finest ingredients and utmost care.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((dish, index) => (
              <div
                key={dish.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <DishCard dish={{
                  ...dish,
                  image: dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
                  isVeg: dish.is_veg,
                  isAvailable: dish.is_available,
                  category: ''
                }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
