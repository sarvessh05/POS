import { useMenuItems } from '@/hooks/useDatabase';
import DishCard from './DishCard';
import { Loader2 } from 'lucide-react';

const FeaturedSection = () => {
  const { data: menuItems, isLoading } = useMenuItems();
  const featuredItems = menuItems?.filter((item) => item.rating && item.rating >= 4.5).slice(0, 4) || [];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[20%] left-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              Chef's Masterpieces
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
              A Selection of <br />
              <span className="text-primary italic font-light italic-font">Exquisite</span> Favorites
            </h2>
          </div>
          <p className="text-foreground/50 text-lg font-medium max-w-sm leading-relaxed mb-2">
            Handpicked signature creations that define our culinary philosophy of balance and beauty.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="relative">
               <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-24 gap-4">
            {featuredItems.map((dish, index) => (
              <div
                key={dish.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <DishCard 
                  readOnly={true}
                  dish={{
                    ...dish,
                    image: dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
                    isVeg: dish.is_veg,
                    isAvailable: dish.is_available,
                    category: ''
                  }} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
