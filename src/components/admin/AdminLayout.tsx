import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Calendar,
  Users,
  Gift,
  BarChart3,
  Settings,
  LogOut,
  ChefHat,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: UtensilsCrossed, label: 'Menu', href: '/admin/menu' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: Gift, label: 'Loyalty', href: '/admin/loyalty' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-sidebar-primary-foreground">
                Spice Haven
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
