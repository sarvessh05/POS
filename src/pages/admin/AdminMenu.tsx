import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { menuItems as initialMenuItems, categories } from '@/data/mockData';
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminMenu = () => {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
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
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-3 h-3 rounded-sm flex items-center justify-center ${
                            item.isVeg ? 'bg-sage' : 'bg-destructive'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-card" />
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.isVeg ? 'Veg' : 'Non-veg'}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                    {item.category}
                  </span>
                </TableCell>
                <TableCell className="font-medium">₹{item.price}</TableCell>
                <TableCell>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-gold text-gold" />
                      <span>{item.rating}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={item.isAvailable}
                    onCheckedChange={() => toggleAvailability(item.id)}
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
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;
