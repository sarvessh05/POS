import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

