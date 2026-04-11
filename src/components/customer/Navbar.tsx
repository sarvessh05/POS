import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, User, Calendar, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { totalItems } = useCart();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/booking', label: 'Book Table' },
    { href: '/loyalty', label: 'Rewards' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-warm flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Spice Haven
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <div className="hidden md:block">
              {user ? (
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <Button variant="hero" size="sm">Sign In</Button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    {user ? (
                      <div className="flex flex-col gap-2 w-full">
                        <span className="font-medium truncate">{user.email}</span>
                        <Button variant="outline" size="sm" onClick={() => { signOut(); setIsOpen(false); }}>
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Button variant="hero" className="w-full">Sign In</Button>
                    )}
                  </div>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        isActive(link.href)
                          ? 'text-primary'
                          : 'text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="border-border" />
                  {user && (
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary"
                    >
                      <User className="h-5 w-5" />
                      My Profile
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
