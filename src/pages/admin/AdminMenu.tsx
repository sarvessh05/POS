import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useMenuItems, useCategories } from '@/hooks/useDatabase';
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminMenu = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: menuItems, isLoading } = useMenuItems();
  const queryClient = useQueryClient();

  const filteredItems = menuItems?.filter(
    (item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categories?.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_exhausted: currentStatus }) // Inverting logic: isAvailable = !is_exhausted
        .eq('id', id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
      toast.success("Availability updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Menu Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, or remove menu items
          </p>
        </div>
        <Button variant="hero" className="gap-2">
          <Plus className="w-5 h-5" />
          Add Dish
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12"
        />
      </div>

      {/* Menu Table */}
      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-300">Synchronizing Menu...</p>
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Dish</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-3 h-3 rounded-sm flex items-center justify-center ${
                            item.is_veg ? 'bg-sage' : 'bg-destructive'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-card" />
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.is_veg ? 'Veg' : 'Non-veg'}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                    {item.categories?.name}
                  </span>
                </TableCell>
                <TableCell className="font-medium">₹{item.price}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span>{item.rating || '4.5'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={!item.is_exhausted}
                    onCheckedChange={(checked) => toggleAvailability(item.id, !checked)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;
