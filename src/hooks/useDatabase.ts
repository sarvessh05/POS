import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useMenuItems = (categoryId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('menu_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['menu_items'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['menu_items', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('menu_items')
        .select('*, categories(name)')
        .order('name', { ascending: true });
      
      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};


export const useBookTable = () => {
  return {
    mutateAsync: async (booking: {
      customer_name: string;
      customer_phone: string;
      booking_date: string;
      time_slot: string;
      guests: number;
    }) => {
      const { data, error } = await supabase
        .from('table_bookings')
        .insert([booking])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  };
};

export const useOrderedDishes = (tableId?: string) => {
  return useQuery({
    queryKey: ['ordered_dishes', tableId],
    queryFn: async () => {
      if (!tableId) return [];
      
      // Get all orders for this table that haven't been billed/paid yet
      // For simplicity, we fetch all non-cancelled orders from the last 12 hours
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('table_id', tableId)
        .neq('status', 'cancelled')
        .gt('created_at', twelveHoursAgo);
        
      if (ordersError) throw ordersError;
      if (!orders || orders.length === 0) return [];
      
      const orderIds = orders.map(o => o.id);
      
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, menu_items(*)')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });
        
      if (itemsError) throw itemsError;
      
      return orderItems.map(item => ({
        ...item.menu_items,
        quantity: item.quantity,
        order_id: item.order_id,
        item_id: item.id,
        created_at: item.created_at
      }));
    },
    enabled: !!tableId,
  });
};

export const useTableStatus = (tableId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tableId) return;

    const channel = supabase
      .channel(`table_status_${tableId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tables',
          filter: `id=eq.${tableId}`
        },
        (payload) => {
          queryClient.setQueryData(['table_status', tableId], payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId, queryClient]);

  return useQuery({
    queryKey: ['table_status', tableId],
    queryFn: async () => {
      if (!tableId) return null;
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('id', tableId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tableId,
  });
};

export const useRequestBill = () => {
  return {
    mutateAsync: async (tableId: string) => {
      const { data, error } = await supabase
        .from('tables')
        .update({ status: 'request_bill' })
        .eq('id', tableId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  };
};

export const useFinishTable = () => {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (tableId: string) => {
      const { data, error } = await supabase
        .from('tables')
        .update({ status: 'billing' })
        .eq('id', tableId)
        .select()
        .single();
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['table_status', tableId] });
      queryClient.invalidateQueries({ queryKey: ['captain_orders'] });
      return data;
    }
  };
};

export const useCaptainOrders = (captainId?: string) => {
  return useQuery({
    queryKey: ['captain_orders', captainId],
    queryFn: async () => {
      // Fetch active orders for tables assigned to this captain
      // For MVP, we fetch all active tables and their most recent order
      const { data: tables, error: tableError } = await supabase
        .from('tables')
        .select('*, orders(*, order_items(*, menu_items(*)))')
        .order('number', { ascending: true });
        
      if (tableError) throw tableError;
      return tables;
    },
    refetchInterval: 10000, // Poll every 10s as backup to Realtime
  });
};

export const useGenerateKOT = () => {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ kot_generated_at: new Date().toISOString() })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Also create KOT entry
      await supabase.from('kot').insert({
        order_id: orderId,
        status: 'printed',
        printed_at: new Date().toISOString()
      });
      
      queryClient.invalidateQueries({ queryKey: ['captain_orders'] });
    }
  };
};

export const useMarkServed = () => {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'served' })
        .eq('id', orderId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['captain_orders'] });
    }
  };
};

export const useResetTable = () => {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (tableId: string) => {
      const { error } = await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', tableId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['captain_orders'] });
    }
  };
};

export const useTaxConfig = () => {
  return useQuery({
    queryKey: ['tax_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_config')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error || !data) {
        // Fallback to defaults if no config found or error occurs
        return { gst_rate: 5.00, service_charge_rate: 0.00 };
      }
      return data;
    },
  });
};

export const useSubmitRating = () => {
  return {
    mutateAsync: async (ratings: {
      dish_id: string;
      order_id: string;
      rating: number;
      comment?: string;
    }[]) => {
      const { data, error } = await supabase
        .from('dish_ratings')
        .insert(ratings);
      if (error) throw error;
      return data;
    }
  };
};

export const useTables = () => {
  return useQuery({
    queryKey: ['tables_full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*, captains(name)')
        .order('number', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useCaptains = () => {
  return useQuery({
    queryKey: ['captains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('captains')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useAddTable = () => {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (table: any) => {
      const qr_token = Math.random().toString(36).substring(2, 11);
      const { data, error } = await supabase
        .from('tables')
        .insert([{ ...table, qr_token }])
        .select()
        .single();
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tables_full'] });
      return data;
    }
  };
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (id: string) => {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tables_full'] });
    }
  };
};

export const useRegenerateQR = () => {
  const queryClient = useQueryClient();
  return {
    mutateAsync: async (id: string) => {
      const qr_token = Math.random().toString(36).substring(2, 11);
      const { error } = await supabase
        .from('tables')
        .update({ qr_token })
        .eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tables_full'] });
    }
  };
};

export const useAllOrders = (statusFilter?: string) => {
  return useQuery({
    queryKey: ['admin_orders', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*)), tables(*)')
        .order('created_at', { ascending: false });
        
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async ({orderId, status}: {orderId: string, status: string}) => {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
            queryClient.invalidateQueries({ queryKey: ['captain_orders'] });
        }
    };
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');
        
      const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
      
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
        
      const { count: activeTables } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'available');
        
      return {
        totalRevenue,
        orderCount: orderCount || 0,
        activeTables: activeTables || 0,
        avgPrepTime: '15.2m'
      };
    },
    refetchInterval: 30000,
  });
};

export const usePlaceOrder = () => {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async ({
            order_type,
            table_number,
            total_amount,
            items
        }: {
            order_type: string;
            table_number?: string;
            total_amount: number;
            items: any[];
        }) => {
            let table_id = null;
            
            // If we have a table number, try to resolve it to an ID
            if (table_number) {
                const { data: tableData, error: tableError } = await supabase
                    .from('tables')
                    .select('id')
                    .eq('number', parseInt(table_number))
                    .maybeSingle();
                
                if (tableData) {
                    table_id = tableData.id;
                } else if (!tableData && table_number) {
                    console.error("Table lookup failed for number:", table_number, tableError);
                    // We can still proceed without table_id for takeaway, 
                    // but for dine-in we should ideally have it.
                }
            }

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    order_type,
                    table_id,
                    total_amount,
                    status: 'pending'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            const order_items = items.map(item => ({
                order_id: order.id,
                menu_item_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                notes: item.specialInstructions || ''
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(order_items);

            if (itemsError) throw itemsError;

            if (table_id) {
                await supabase
                    .from('tables')
                    .update({ status: 'occupied' })
                    .eq('id', table_id);
            }

            queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
            queryClient.invalidateQueries({ queryKey: ['captain_orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
            
            return order;
        }
    };
};
