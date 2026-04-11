import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

interface CartSheetProps {
  children: React.ReactNode;
}

const CartSheet = ({ children }: CartSheetProps) => {
  const { items, totalItems, totalAmount, updateQuantity, removeItem } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Add some delicious items to get started
              </p>
              <Link to="/menu">
                <Button variant="soft">Browse Menu</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-card rounded-xl"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} each
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <span className="font-display font-semibold text-primary">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mt-4 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display font-bold text-foreground">
                    ₹{totalAmount}
                  </span>
                </div>
                <Link to="/cart" className="block">
                  <Button variant="hero" size="lg" className="w-full gap-2">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
