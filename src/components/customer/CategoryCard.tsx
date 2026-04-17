import { Category } from '@/types';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: Category;
  isActive?: boolean;
  onClick: () => void;
}

const CategoryCard = ({ category, isActive, onClick }: CategoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-8 py-3 rounded-full transition-colors duration-500 whitespace-nowrap font-bold text-sm tracking-tight z-10 ${
        isActive ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/60'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeCategory"
          className="absolute inset-0 bg-[#f5c22c] rounded-full shadow-md -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      {category.name}
    </button>
  );
};

export default CategoryCard;

