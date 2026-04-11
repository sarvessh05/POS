import { useState } from 'react';
import WaiterLayout from '@/components/waiter/WaiterLayout';
import { sampleOrders } from '@/data/mockData';
import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Printer, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const WaiterOrders = () => {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      )
    );
    toast.success(`Order marked as ${newStatus}`);
  };

  const handlePrintKOT = (orderId: string) => {
    toast.success('KOT sent to kitchen printer');
  };

  const activeOrders = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  );

  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-gold-light border-gold',
    accepted: 'bg-terracotta-light border-primary',
    preparing: 'bg-terracotta-light border-primary',
    ready: 'bg-sage-light border-sage',
    completed: 'bg-muted border-border',
    cancelled: 'bg-destructive/10 border-destructive',
  };

  return (
    <WaiterLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Active Orders
        </h1>
        <p className="text-muted-foreground text-sm">
          {activeOrders.length} orders to manage
        </p>
      </div>

      <div className="space-y-4">
        {activeOrders.map((order) => (
          <div
            key={order.id}
            className={`bg-card rounded-2xl p-5 border-2 ${statusColors[order.status]} shadow-soft`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-foreground">
                    {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    order.status === 'ready' ? 'bg-sage text-primary-foreground' :
                    order.status === 'pending' ? 'bg-gold text-charcoal' :
                    'bg-primary text-primary-foreground'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(order.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-3 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span className="font-medium text-foreground">
                    {item.quantity}x {item.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold text-primary">
                ₹{order.totalAmount}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrintKOT(order.id)}
                  className="gap-1"
                >
                  <Printer className="w-4 h-4" />
                  KOT
                </Button>
                {order.status === 'ready' && (
                  <Button
                    variant="sage"
                    size="sm"
                    onClick={() => handleStatusChange(order.id, 'completed')}
                    className="gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Served
                  </Button>
                )}
                {order.status === 'pending' && (
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => handleStatusChange(order.id, 'accepted')}
                  >
                    Accept
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {activeOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-sage" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              All caught up!
            </h3>
            <p className="text-muted-foreground">
              No active orders at the moment.
            </p>
          </div>
        )}
      </div>
    </WaiterLayout>
  );
};

export default WaiterOrders;
