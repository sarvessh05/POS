import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Utensils, MessageSquareText } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';
import { useTable } from '@/contexts/TableContext';
import { useOrderedDishes, useTaxConfig, useTableStatus, useRequestBill } from '@/hooks/useDatabase';
import RatingFlow from './RatingFlow';
import BillReceipt from './BillReceipt';

interface CartSheetProps {
  children: React.ReactNode;
}

const CartSheet = ({ children }: CartSheetProps) => {
  const { items, totalItems, totalAmount, updateQuantity, removeItem, updateInstructions, clearCart } = useCart();
  const { session } = useTable();
  const { data: orderedDishes, refetch: refetchOrders } = useOrderedDishes(session?.tableId);
  const { data: tableStatus } = useTableStatus(session?.tableId);
  const { mutateAsync: requestBill } = useRequestBill();
  const { data: taxConfig } = useTaxConfig();
  const { toast } = useToast();
  const [showRatingFlow, setShowRatingFlow] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [billRequested, setBillRequested] = useState(false);

  const orderedSubtotal = orderedDishes?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  const handlePlaceOrder = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f5c22c', '#ffffff', '#22c55e']
    });

    toast({
      title: "Order Placed! 🎉",
      description: "Chef is already working on your delicious meal.",
    });

    // In a real app, we'd send to DB here
    setTimeout(() => {
        clearCart();
        refetchOrders();
    }, 2000);
  };

  const handleRequestBill = async () => {
    if (!session?.tableId) return;
    
    try {
      await requestBill(session.tableId);
      setBillRequested(true);
      toast({
        title: "Bill Requested 🛎️",
        description: "Our captain will be with you shortly to finalize your bill.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to request bill. Please try again or call a waiter.",
        variant: "destructive"
      });
    }
  };

  // Automatically show bill when captain marks as billing
  useEffect(() => {
    if (tableStatus?.status === 'billing' && !showBill && !showRatingFlow) {
        if (orderedDishes && orderedDishes.length > 0) {
            setShowRatingFlow(true);
        } else {
            setShowBill(true);
        }
    }
  }, [tableStatus?.status, orderedDishes]);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-white/95 backdrop-blur-xl border-l border-white/40 shadow-premium p-0 flex flex-col">
        <SheetHeader className="p-6 border-bottom border-foreground/5 bg-white/50">
          <SheetTitle className="font-display text-3xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Utensils className="w-8 h-8 text-primary" />
                <span>Your Table</span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 px-3 py-1 rounded-full">
                Table #04
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {/* Order History Section */}
          <AnimatePresence>
            {orderedDishes && orderedDishes.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        Already Ordered
                    </h3>
                    <span className="font-mono text-[10px] font-bold text-foreground/20">₹{orderedSubtotal}</span>
                </div>
                <div className="space-y-3 bg-foreground/[0.02] rounded-3xl p-4 border border-foreground/[0.03]">
                  {orderedDishes.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-foreground/40">{item.quantity}x</span>
                         <span className="text-sm font-bold text-foreground/60">{item.name}</span>
                      </div>
                      <span className="font-mono text-xs text-foreground/30">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center mb-6 animate-pulse">
                <ShoppingBag className="w-16 h-16 text-primary/20" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">
                Hungry?
              </h3>
              <p className="text-foreground/40 text-sm max-w-[200px] mb-8">
                Your cart is lonely. Fill it with something tasty!
              </p>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group relative bg-white rounded-3xl p-4 shadow-soft border border-white hover:shadow-premium transition-all duration-500"
                  >
                    <div className="flex gap-4">
                        <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-soft group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                            <h4 className="font-bold text-foreground truncate text-lg">
                                {item.name}
                            </h4>
                            <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">
                                ₹{item.price}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-foreground/5 p-1 rounded-full w-fit">
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                            >
                                <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="font-bold w-10 text-center text-sm">
                                {item.quantity}
                            </span>
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-green-50 hover:text-green-500 transition-colors shadow-sm"
                            >
                                <Plus className="w-3 h-3" />
                            </motion.button>
                        </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-foreground/20 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="font-display font-black text-primary text-xl">
                                ₹{item.price * item.quantity}
                            </span>
                        </div>
                    </div>

                    {/* Special Instructions */}
                    <div className="mt-4 pt-4 border-t border-foreground/5">
                        <div className="flex items-center gap-2 mb-2 text-foreground/40">
                             <MessageSquareText className="w-3 h-3" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Special Note</span>
                        </div>
                        <Input 
                            placeholder="Less spicy, extra cheese, etc..."
                            value={item.specialInstructions || ''}
                            onChange={(e) => updateInstructions(item.id, e.target.value)}
                            className="bg-foreground/5 border-none h-10 rounded-xl text-xs placeholder:text-foreground/20 focus-visible:ring-primary/20"
                        />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer with Summary & Place Order */}
        <AnimatePresence>
            {items.length > 0 && (
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 200 }}
                    className="p-6 bg-white border-t border-foreground/5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[3rem]"
                >
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-foreground/40 font-bold uppercase tracking-wider">Subtotal</span>
                            <span className="font-black text-foreground">₹{totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-foreground/40 font-bold uppercase tracking-wider">Estimated Tax</span>
                            <span className="font-black text-foreground">₹{(totalAmount * 0.05).toFixed(0)}</span>
                        </div>
                        <div className="h-px bg-foreground/5" />
                        <div className="flex justify-between items-center">
                            <span className="font-display font-bold text-xl">Grand Total</span>
                            <span className="font-display font-black text-3xl text-primary">
                                ₹{(totalAmount * 1.05).toFixed(0)}
                            </span>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handlePlaceOrder}
                        variant="hero" 
                        size="lg" 
                        className="w-full h-16 rounded-2xl gap-3 text-lg font-bold shadow-premium group"
                    >
                        <span>Place Order</span>
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            <ArrowRight className="w-6 h-6" />
                        </motion.div>
                    </Button>

                    <p className="text-[10px] text-center text-foreground/30 mt-4 font-black uppercase tracking-[0.2em]">
                        Prices inclusive of current taxes
                    </p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Request Bill Button - Persistent if ordered something and not already done */}
        {orderedDishes && orderedDishes.length > 0 && tableStatus?.status !== 'billing' && (
          <div className="p-6 pt-0">
            <Button 
              variant={billRequested || tableStatus?.status === 'request_bill' ? "secondary" : "outline"}
              disabled={billRequested || tableStatus?.status === 'request_bill'}
              className="w-full h-14 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px] gap-2"
              onClick={handleRequestBill}
            >
              {billRequested || tableStatus?.status === 'request_bill' ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
                     🛎️
                  </motion.div>
                  Bill Requested...
                </>
              ) : (
                "Request Final Bill"
              )}
            </Button>
            {tableStatus?.status === 'request_bill' && (
              <p className="text-[8px] text-center text-primary/40 mt-2 font-bold uppercase tracking-widest">Captain is reviewing your orders...</p>
            )}
          </div>
        )}

        <AnimatePresence>
          {showRatingFlow && orderedDishes && (
            <RatingFlow 
              orderedDishes={orderedDishes}
              onComplete={() => {
                setShowRatingFlow(false);
                setShowBill(true);
              }}
              onSkip={() => {
                setShowRatingFlow(false);
                setShowBill(true);
              }}
            />
          )}
        </AnimatePresence>

        {/* Bill Receipt Overlay */}
        <AnimatePresence>
          {showBill && orderedDishes && taxConfig && (
            <BillReceipt 
              items={orderedDishes}
              subtotal={orderedSubtotal}
              taxConfig={taxConfig}
              onClose={() => setShowBill(false)}
              onPaid={() => {
                setShowBill(false);
                clearCart();
                toast({
                  title: "Payment Received! ❤️",
                  description: "Thank you for dining with Flavor Haven.",
                });
                // In a real app, we'd close the table session here
              }}
            />
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;

