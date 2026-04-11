import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useDatabase';
import { ArrowRight, Loader2 } from 'lucide-react';

const CategoriesSection = () => {
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Explore
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
              Our Categories
            </h2>
          </div>
          <Link
            to="/menu"
            className="hidden md:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View Full Menu
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((category, index) => (
              <Link
                key={category.id}
                to={`/menu?category=${category.id}`}
                className="group animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 group-hover:bg-primary group-hover:text-primary-foreground">
                  <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon || '🍛'}
                  </span>
                  <h3 className="font-display text-lg font-semibold mb-1 truncate">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/80">
                    Explore
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/menu"
          className="md:hidden flex items-center justify-center gap-2 text-primary font-medium mt-8"
        >
          View Full Menu
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default CategoriesSection;
