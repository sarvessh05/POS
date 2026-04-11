import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, Tag, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const CartPage = () => {
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const handlePlaceOrder = () => {
    if (orderType === 'dine-in' && !tableNumber) {
      toast.error('Please enter your table number');
      return;
    }
    toast.success('Order placed successfully!');
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet. Explore our menu and find something delicious!
            </p>
            <Link to="/menu">
              <Button variant="hero" size="lg">
                Browse Menu
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Link to="/menu" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-5 h-5" />
          Continue Shopping
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="font-display text-3xl font-bold text-foreground mb-6">
              Your Cart
            </h1>

            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-card rounded-2xl shadow-soft"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium w-8 text-center text-lg">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-display text-xl font-bold text-primary">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                Order Summary
              </h2>

              {/* Order Type */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-foreground mb-3 block">
                  Order Type
                </Label>
                <RadioGroup
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as 'dine-in' | 'takeaway')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dine-in" id="dine-in" />
                    <Label htmlFor="dine-in">Dine-in</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="takeaway" id="takeaway" />
                    <Label htmlFor="takeaway">Takeaway</Label>
                  </div>
                </RadioGroup>
              </div>

              {orderType === 'dine-in' && (
                <div className="mb-6">
                  <Label htmlFor="table" className="text-sm font-medium text-foreground mb-2 block">
                    Table Number
                  </Label>
                  <Input
                    id="table"
                    type="number"
                    placeholder="Enter table number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="h-12"
                  />
                </div>
              )}

              {/* Coupon */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Apply Coupon
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  <Button variant="soft" className="h-12">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 py-4 border-t border-b border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (5%)</span>
                  <span>₹{Math.round(totalAmount * 0.05)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold text-foreground py-4">
                <span>Total</span>
                <span className="font-display text-primary">
                  ₹{Math.round(totalAmount * 1.05)}
                </span>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
