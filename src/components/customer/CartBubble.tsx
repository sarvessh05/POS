import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import CartSheet from './CartSheet';

const CartBubble = () => {
  const { totalItems, totalAmount } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-28 md:bottom-8 right-6 md:right-8 z-50">
      <CartSheet>
        <motion.button
          initial={{ scale: 0, y: 100 }}
          animate={{ 
            scale: 1, 
            y: 0,
            rotate: [0, -10, 10, -10, 0],
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{
            rotate: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              repeatDelay: 3
            },
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="relative bg-primary text-white p-5 rounded-full shadow-premium flex items-center gap-3 overflow-hidden group"
        >
          <div className="relative">
            <ShoppingBag className="w-7 h-7" />
            <AnimatePresence>
                <motion.span 
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary shadow-soft"
                >
                    {totalItems}
                </motion.span>
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col items-start pr-2">
            <span className="text-[10px] opacity-70 uppercase tracking-widest font-black leading-none mb-1">View Order</span>
            <span className="text-sm font-bold leading-none">₹{totalAmount}</span>
          </div>

          <motion.div 
            className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
          />
        </motion.button>
      </CartSheet>
    </div>
  );
};

export default CartBubble;
