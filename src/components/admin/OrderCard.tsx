import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-gold-light text-gold border-gold/30',
  accepted: 'bg-terracotta-light text-terracotta border-terracotta/30',
  preparing: 'bg-terracotta-light text-primary border-primary/30',
  ready: 'bg-sage-light text-sage border-sage/30',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
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

  return (
    <div className={`bg-card rounded-2xl p-5 shadow-soft border ${statusColors[order.status]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {order.id}
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground mt-1">
            {order.customerName}
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{order.type}</span>
        </div>
        {order.tableNumber && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>Table {order.tableNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            {new Date(order.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.quantity}x {item.name}
            </span>
            <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="font-display text-lg font-bold text-primary">
          ₹{order.totalAmount}
        </span>
        {next && (
          <Button
            variant="soft"
            size="sm"
            onClick={() => onStatusChange(order.id, next)}
          >
            Mark as {next}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
