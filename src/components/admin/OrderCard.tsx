import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, ChevronRight, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const statusConfigs: Record<OrderStatus, { color: string; label: string; icon: string }> = {
  pending: { color: 'bg-gold/10 text-gold border-gold/20', label: 'Order Pending', icon: '🔔' },
  accepted: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Accepted', icon: '✅' },
  preparing: { color: 'bg-primary/10 text-primary border-primary/20', label: 'In Kitchen', icon: '🍳' },
  ready: { color: 'bg-sage/10 text-sage border-sage/20', label: 'Ready to Serve', icon: '🍽️' },
  completed: { color: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Completed', icon: '🏁' },
  cancelled: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Cancelled', icon: '❌' },
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
};

const OrderCard = ({ order, onStatusChange }: OrderCardProps) => {
  const next = nextStatus[order.status];
  const config = statusConfigs[order.status];

  return (
    <div className={`bg-white rounded-[2rem] p-6 shadow-soft border border-foreground/5 hover:shadow-premium transition-all duration-300 relative overflow-hidden group`}>
      {/* Visual Indicator Line */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${config.color.split(' ')[0]}`} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Hash className="w-3 h-3 text-foreground/20" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
               {order.id.slice(-6).toUpperCase()}
             </span>
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {order.customerName}
          </h3>
        </div>
        <Badge className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest border ${config.color}`}>
          <span className="mr-1.5">{config.icon}</span>
          {config.label}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] font-black uppercase tracking-widest text-foreground/40 mb-6 pb-6 border-b border-foreground/5">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span>{order.type}</span>
        </div>
        {order.tableNumber && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-foreground">Table {order.tableNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Clock className="w-4 h-4 text-foreground/20" />
          <span>
            {new Date(order.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center group/item">
            <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-50 text-[10px] font-black text-foreground border border-slate-100 group-hover/item:border-primary/20 transition-colors">
                    {item.quantity}
                </span>
                <span className="text-sm font-bold text-foreground/70 group-hover/item:text-foreground transition-colors">
                    {item.name}
                </span>
            </div>
            <span className="text-xs font-black text-foreground/80 tracking-tighter">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-6 border-t-2 border-dashed border-foreground/5">
        <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest leading-none mb-1">Total Bill</span>
            <span className="text-2xl font-black text-foreground tracking-tighter balance-text">
                ₹{order.totalAmount}
            </span>
        </div>
        {next && (
          <Button
            className="rounded-2xl h-12 px-6 gap-2 bg-foreground text-white hover:bg-primary hover:shadow-glow transition-all font-bold"
            onClick={() => onStatusChange(order.id, next)}
          >
            <span>Proceed to {next}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
