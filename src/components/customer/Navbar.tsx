import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, User, Calendar, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/ui/logo';

const Navbar = () => {
  const { totalItems } = useCart();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/loyalty', label: 'Rewards' },
    { href: '/offers', label: 'Offers' },
  ];

  const isMenuPage = location.pathname.startsWith('/menu') || location.pathname.startsWith('/dine');
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`${isMenuPage ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 pointer-events-none`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-3xl px-6 py-4 pointer-events-auto shadow-premium border-white/60">
        {/* Logo */}
        <Link to="/" className="pointer-events-auto">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-xs font-bold tracking-[0.2em] uppercase transition-all hover:text-primary ${
                isActive(link.href)
                  ? 'text-primary'
                  : 'text-foreground/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/booking" className="hidden lg:block">
            <Button variant="hero" size="sm" className="px-7 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-soft hover:shadow-premium transform hover:-translate-y-0.5 transition-all">
              Reserve Table
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground/70"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-80 bg-background/30 backdrop-blur-2xl border-l border-white/40">
          <div className="flex flex-col gap-10 mt-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <span className="text-2xl">🍵</span>
              </div>
              <span className="font-display text-3xl font-bold">SpiceHaven</span>
            </div>

            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-2xl font-display font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-primary'
                      : 'text-foreground/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-display font-medium transition-colors ${
                  isActive('/booking') ? 'text-primary' : 'text-foreground/50'
                }`}
              >
                Reserve Table
              </Link>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-6">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-3xl bg-primary/5">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[150px]">{user.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Loyalty Member</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl py-6 border-primary/20 text-primary hover:bg-primary/5" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="hero" className="w-full rounded-2xl py-7 font-bold uppercase tracking-widest text-xs">
                  Join the Club
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};


export default Navbar;
