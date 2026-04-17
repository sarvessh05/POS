import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Bell, User, LogOut } from 'lucide-react';
import Logo from '@/components/ui/logo';

interface WaiterLayoutProps {
  children: ReactNode;
}

const WaiterLayout = ({ children }: WaiterLayoutProps) => {
  const location = useLocation();

  const navItems = [
    { icon: ClipboardList, label: 'Orders', href: '/waiter' },
    { icon: Bell, label: 'New', href: '/waiter/new' },
    { icon: User, label: 'Profile', href: '/waiter/profile' },
  ];

  return (
    <div className="min-h-screen bg-muted pb-20">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo showText={false} imageClassName="w-11 h-11" />
            <div>
              <h1 className="font-display text-lg font-semibold text-sidebar-primary-foreground leading-tight">
                Waiter Panel
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-bold">Spice Haven</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-sidebar-accent flex items-center justify-center hover:bg-sidebar-primary transition-colors group">
            <LogOut className="w-5 h-5 group-hover:text-white transition-colors" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default WaiterLayout;
