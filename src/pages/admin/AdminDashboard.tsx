import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import OrderCard from '@/components/admin/OrderCard';
import { sampleOrders } from '@/data/mockData';
import { Order, OrderStatus } from '@/types';
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react';

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      )
    );
  };

  const activeOrders = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Orders"
          value="48"
          change="12%"
          changeType="positive"
          icon={ShoppingBag}
        />
        <StatCard
          title="Revenue"
          value="₹24,500"
          change="8%"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-sage-light text-sage"
        />
        <StatCard
          title="Active Tables"
          value="12/20"
          icon={Users}
          iconColor="bg-gold-light text-gold"
        />
        <StatCard
          title="Avg. Order Value"
          value="₹510"
          change="3%"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-secondary text-secondary-foreground"
        />
      </div>

      {/* Active Orders */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Active Orders
            </h2>
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
              {activeOrders.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
          {activeOrders.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No active orders at the moment.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
