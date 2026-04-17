import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderCard from '@/components/admin/OrderCard';
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/useDatabase';
import { Order, OrderStatus } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const AdminOrders = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const { data: allOrders, isLoading } = useAllOrders();
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateStatus({ orderId, status: newStatus });
  };

  const filteredOrders = allOrders?.filter((o: any) => 
    activeTab === 'all' ? true : o.status === activeTab
  ) || [];

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

      <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({allOrders?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({allOrders?.filter((o:any) => o.status === 'pending').length || 0})
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Preparing ({allOrders?.filter((o:any) => o.status === 'preparing').length || 0})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready ({allOrders?.filter((o:any) => o.status === 'ready').length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({allOrders?.filter((o:any) => o.status === 'completed').length || 0})
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-300">Fetching live orders...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order: any) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
        )}
      </Tabs>
    </AdminLayout>
  );
};

export default AdminOrders;
