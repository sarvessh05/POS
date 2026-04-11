import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  isActive?: boolean;
  onClick: () => void;
}

const CategoryCard = ({ category, isActive, onClick }: CategoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 min-w-[100px] ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-medium scale-105'
          : 'bg-card hover:bg-accent text-card-foreground hover:scale-[1.02]'
      }`}
    >
      <span className="text-3xl">{category.icon}</span>
      <span className="font-medium text-sm">{category.name}</span>
      <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
        {category.count} items
      </span>
    </button>
  );
};

export default CategoryCard;
