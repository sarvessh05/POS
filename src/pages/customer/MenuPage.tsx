import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import CategoryCard from '@/components/customer/CategoryCard';
import DishCard from '@/components/customer/DishCard';
import { useCategories, useMenuItems } from '@/hooks/useDatabase';
import { Input } from '@/components/ui/input';

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: menuItems, isLoading: itemsLoading } = useMenuItems(activeCategory || undefined);

  const filteredItems = menuItems?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  }) || [];

  const isLoading = categoriesLoading || itemsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pb-20">
        {/* Header */}
        <section className="bg-muted py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center mb-4">
              Our Menu
            </h1>
            <p className="text-muted-foreground text-center max-w-lg mx-auto mb-8">
              Explore our carefully curated selection of dishes, prepared with love and the finest ingredients.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-background border-border rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <CategoryCard
                category={{ id: 'all', name: 'All', icon: '🍴', count: 0 }}
                isActive={!activeCategory}
                onClick={() => setActiveCategory(null)}
              />
              {categories?.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={{
                    id: category.id,
                    name: category.name,
                    icon: category.icon || '🍛',
                    count: 0 // We can calculate this if needed
                  }}
                  isActive={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Menu Items */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading delicious dishes...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No dishes found. Try a different search or category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((dish, index) => (
                  <div
                    key={dish.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <DishCard dish={{
                      ...dish,
                      image: dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
                      isVeg: dish.is_veg,
                      isAvailable: dish.is_available,
                      category: '' // Handled by backend query if needed
                    }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MenuPage;
