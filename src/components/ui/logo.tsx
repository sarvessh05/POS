import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  isDark?: boolean;
}

const Logo = ({ className, imageClassName, textClassName, showText = true, isDark = false }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 overflow-hidden bg-primary p-1.5",
        imageClassName
      )}>
        <img 
          src="/favicon.png" 
          alt="Spice Haven Logo" 
          className="w-full h-full object-contain brightness-110" 
        />
      </div>
      {showText && (
        <span className={cn(
          "font-display text-2xl font-bold tracking-tight",
          isDark ? "text-background" : "text-foreground",
          textClassName
        )}>
          Spice<span className="text-primary italic">Haven</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
