import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderCard from '@/components/admin/OrderCard';
import { sampleOrders } from '@/data/mockData';
import { Order, OrderStatus } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminOrders = () => {
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

  const filterByStatus = (status: OrderStatus | 'all') => {
    if (status === 'all') return orders;
    return orders.filter((o) => o.status === status);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Orders
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and track all incoming orders
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({filterByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Preparing ({filterByStatus('preparing').length})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready ({filterByStatus('ready').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        {['all', 'pending', 'preparing', 'ready', 'completed'].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterByStatus(status as OrderStatus | 'all').map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
};

export default AdminOrders;
