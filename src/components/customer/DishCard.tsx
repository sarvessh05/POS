import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Leaf, Flame, Beef } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DishCardProps {
  dish: MenuItem;
  readOnly?: boolean;
}

const DishCard = ({ dish, readOnly = false }: DishCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dish.isAvailable) return;

    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
    });
    toast({
      title: "Added to cart",
      description: `${dish.name} has been added to your order.`,
    });
  };

  return (
    <motion.div 
      className="group relative pt-12 perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={`relative bg-white rounded-[3rem] px-6 pb-8 pt-24 transition-all duration-500 shadow-soft group-hover:shadow-premium border border-white/60 flex flex-col items-center text-center ${!dish.isAvailable ? 'grayscale-[0.8] opacity-80' : ''}`}>
        
        {/* Circular Image Perspective */}
        <motion.div 
          className="absolute top-0 left-1/2 w-40 h-40 rounded-full border-[6px] border-white shadow-premium overflow-hidden z-20"
          initial={{ x: "-50%", y: "-50%" }}
          animate={{ 
            x: "-50%",
            y: "-50%",
            rotate: isHovered ? 15 : 0,
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover select-none"
          />
        </motion.div>

        {/* Badges */}
        <div className="absolute top-4 right-8 flex flex-col gap-2 z-30">
          {dish.isVeg ? (
            <div className="bg-green-100 p-1.5 rounded-full shadow-sm border border-green-200">
                <Leaf className="w-3.5 h-3.5 text-green-600" />
            </div>
          ) : (
            <div className="bg-red-50 p-1.5 rounded-full shadow-sm border border-red-100">
                <Beef className="w-3.5 h-3.5 text-red-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2 mt-4">
          <h3 className="font-display text-2xl font-bold text-foreground leading-tight tracking-tight px-2">
            {dish.name}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-foreground/30 text-[10px] font-black uppercase tracking-[0.2em]">
                {dish.isVeg ? 'Vegetarian' : 'Chef Signature'}
            </span>
            {!dish.isVeg && <Flame className="w-3 h-3 text-orange-500" />}
            {dish.rating && (
                <div className="flex items-center gap-0.5 ml-1">
                    <span className="text-[10px] font-bold text-gold">{dish.rating}</span>
                    <svg className="w-2.5 h-2.5 fill-gold text-gold" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
            )}
          </div>
          <p className="text-foreground/50 text-xs leading-relaxed line-clamp-2 max-w-[200px] mx-auto min-h-[32px]">
            {dish.description || "A curated dish prepared with seasonal specialties."}
          </p>
        </div>

        {/* Price/Action Button */}
        <div className="mt-8 w-full flex justify-center">
            {!readOnly && dish.isAvailable ? (
              <Button 
                onClick={handleAddToCart}
                className="bg-[#f5c22c] hover:bg-[#e2b126] text-foreground rounded-full h-12 px-10 font-bold shadow-soft hover:shadow-lg transition-all border-none flex items-center gap-2 group/btn relative overflow-hidden active:scale-95"
              >
                <span className="text-sm">₹{dish.price}</span>
                <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
                <motion.div 
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            ) : (
                <div className="bg-foreground/5 text-foreground/40 rounded-full h-12 px-10 font-bold shadow-inner flex items-center justify-center min-w-[140px] border border-foreground/10">
                   {dish.isAvailable ? `₹${dish.price}` : 'Sold Out'}
                </div>
            )}
        </div>

        {/* Sold Out Stamp */}
        <AnimatePresence>
            {!dish.isAvailable && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: -15 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
                >
                    <div className="border-4 border-red-600/30 text-red-600/30 font-black text-4xl px-4 py-2 uppercase tracking-tighter rounded-xl rotate-[-5deg] backdrop-blur-[2px]">
                        Sold Out
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
      
      {/* Dynamic Background Blur */}
      <motion.div 
        className="absolute inset-0 bg-primary/10 rounded-[3rem] -z-10 blur-3xl opacity-0"
        animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1.15 : 1
        }}
      />
    </motion.div>
  );
};

export default DishCard;

