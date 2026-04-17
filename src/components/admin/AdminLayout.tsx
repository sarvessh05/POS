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
  Bell,
  Search,
  ChevronDown,
  Table as TableIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: TableIcon, label: 'Tables & QR', href: '/admin/tables' },
  { icon: UtensilsCrossed, label: 'Menu', href: '/admin/menu' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: Users, label: 'Staff Management', href: '/admin/staff' },
  { icon: Gift, label: 'Loyalty Program', href: '/admin/loyalty' },
  { icon: BarChart3, label: 'Advanced Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'System Settings', href: '/admin/settings' },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#f8fafb]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-foreground/5 fixed h-screen z-50">
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-black text-foreground tracking-tight">
                Flavor Haven
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                Elite Admin
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group ${
                    isActive
                      ? 'bg-primary text-white shadow-glow'
                      : 'text-foreground/40 hover:bg-slate-50 hover:text-foreground'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-primary transition-colors'}`} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-8 border-t border-foreground/5">
            <Link 
              to="/login"
              className="flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-destructive hover:bg-destructive/5 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm tracking-tight">Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-72 flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-foreground/5 flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="relative w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Global command search (⌘K)" 
                className="pl-12 h-12 rounded-2xl border-foreground/5 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-6">
              <button className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                 <Bell className="w-5 h-5 text-foreground/40 group-hover:text-foreground transition-colors" />
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-white" />
              </button>
              
              <div className="h-10 w-px bg-foreground/5 mx-2" />
              
              <div className="flex items-center gap-4 group cursor-pointer p-1.5 pl-4 rounded-2xl hover:bg-slate-50 transition-all">
                 <div className="text-right">
                    <p className="text-sm font-bold text-foreground leading-none">Sarvesh G.</p>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Founding Owner</p>
                 </div>
                 <Avatar className="h-11 w-11 rounded-xl shadow-soft">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>SG</AvatarFallback>
                 </Avatar>
                 <ChevronDown className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
              </div>
           </div>
        </header>

        <main className="p-10 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
