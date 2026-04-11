import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  iconColor = 'bg-terracotta-light text-primary',
}: StatCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="font-display text-3xl font-bold text-foreground">
            {value}
          </h3>
          {change && (
            <p
              className={`text-sm mt-2 ${
                changeType === 'positive' ? 'text-sage' : 'text-destructive'
              }`}
            >
              {changeType === 'positive' ? '↑' : '↓'} {change} from yesterday
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
