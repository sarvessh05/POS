import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Sparkles, Filter, Leaf, ChevronRight } from 'lucide-react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import CategoryCard from '@/components/customer/CategoryCard';
import DishCard from '@/components/customer/DishCard';
import CartBubble from '@/components/customer/CartBubble';
import { useCategories, useMenuItems } from '@/hooks/useDatabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: menuItems, isLoading: itemsLoading } = useMenuItems(activeCategory || undefined);

  const filteredItems = menuItems?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !isVegOnly || item.is_veg;
    return matchesSearch && matchesVeg;
  }) || [];

  const isLoading = itemsLoading; // Categories loading is handled separately for smoother UX

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 overflow-x-hidden">
      <Navbar />
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-[10%] left-[-5%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"
          animate={{ x: scrollY * 0.05, y: scrollY * -0.02 }}
        />
        <motion.div 
          className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px]"
          animate={{ x: scrollY * -0.03, y: scrollY * 0.04 }}
        />
      </div>

      <main className="relative z-10 pt-28">
        {/* Header Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-soft">
              <Sparkles className="w-3 h-3" />
              <span>Gastronomic Journey</span>
            </div>
            
            <h1 className="font-display text-6xl md:text-8xl font-bold text-foreground mb-10 leading-[0.9]">
              Curated <br />
              <span className="text-primary italic font-light italic-font">for</span> Flavor
            </h1>

            {/* Premium Search & Filters */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
              <div className="relative flex flex-col md:flex-row items-center gap-4 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-2 border border-white shadow-premium">
                <div className="relative flex-1 w-full flex items-center">
                  <div className="pl-6 pr-3">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search your favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none bg-transparent focus-visible:ring-0 text-lg placeholder:text-foreground/30 h-14"
                  />
                </div>
                
                <div className="flex items-center gap-4 px-6 py-2 md:border-l border-foreground/5 h-10">
                    <div className="flex items-center gap-3">
                        <motion.div 
                            animate={{ scale: isVegOnly ? 1.2 : 1, rotate: isVegOnly ? 15 : 0 }}
                            className={`${isVegOnly ? 'text-green-600' : 'text-foreground/20'}`}
                        >
                            <Leaf className="w-5 h-5" />
                        </motion.div>
                        <Switch 
                            id="veg-mode" 
                            checked={isVegOnly} 
                            onCheckedChange={setIsVegOnly}
                            className="data-[state=checked]:bg-green-600"
                        />
                        <Label htmlFor="veg-mode" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hidden sm:block">
                            Veg Only
                        </Label>
                    </div>
                </div>

                <Button variant="hero" className="w-full md:w-auto rounded-[1.8rem] px-10 h-14 shadow-soft font-bold uppercase tracking-widest text-[10px]">
                  Explore
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Categories Bar */}
        <section className="sticky top-6 z-40 py-8 transition-all overflow-visible">
          <div className="container mx-auto px-4 flex justify-center">
             <div className="bg-white/80 backdrop-blur-md rounded-full p-2 shadow-premium border border-white/60 flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-full no-scrollbar">
              <LayoutGroup>
                <div className="flex-shrink-0">
                  <CategoryCard
                    category={{ id: 'all', name: 'All Categories', icon: '', count: 0 }}
                    isActive={!activeCategory}
                    onClick={() => setActiveCategory(null)}
                  />
                </div>
                {categoriesLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24 rounded-full bg-foreground/5" />
                    ))
                ) : (
                    categories?.map((category) => (
                    <div key={category.id} className="flex-shrink-0">
                        <CategoryCard
                        category={{
                            id: category.id,
                            name: category.name,
                            icon: '',
                            count: 0
                        }}
                        isActive={activeCategory === category.id}
                        onClick={() => setActiveCategory(category.id)}
                        />
                    </div>
                    ))
                )}
              </LayoutGroup>
            </div>
          </div>
        </section>

        {/* Menu Items Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-24 gap-4"
                >
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="pt-12">
                            <div className="bg-white rounded-[3rem] px-6 pb-12 pt-20 border border-white flex flex-col items-center shadow-soft">
                                <Skeleton className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full" />
                                <Skeleton className="h-8 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-1/2 mb-8" />
                                <Skeleton className="h-12 w-full rounded-full" />
                            </div>
                        </div>
                    ))}
                </motion.div>
              ) : filteredItems.length === 0 ? (
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-40"
                >
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Filter className="w-10 h-10 text-primary/40" />
                    </div>
                    <p className="text-foreground/60 text-2xl font-display italic mb-6">
                        No matches found for your filter
                    </p>
                    <Button 
                        variant="link" 
                        onClick={() => { setSearchQuery(''); setIsVegOnly(false); setActiveCategory(null); }}
                        className="text-primary font-bold uppercase tracking-widest text-xs"
                    >
                        Reset All Filters
                    </Button>
                </motion.div>
              ) : (
                <motion.div 
                    key="grid"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-28 gap-6 md:gap-x-10"
                >
                    {filteredItems.map((dish, index) => (
                        <DishCard key={dish.id} dish={{
                            ...dish,
                            image: dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
                            isVeg: dish.is_veg,
                            isAvailable: !dish.is_exhausted,
                            category: '' 
                        }} />
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Floating CTA for Mobile App Feel */}
        <AnimatePresence>
            {scrollY > 500 && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 md:hidden"
                >
                    <Button className="bg-primary text-white rounded-full px-8 py-6 shadow-premium font-bold flex items-center gap-3">
                        View Full Menu <ChevronRight className="w-4 h-4" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="h-20" />
      </main>
      <CartBubble />
      <Footer />
    </div>
  );
};

export default MenuPage;

