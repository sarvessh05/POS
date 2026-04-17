import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[150px]" />
      </div>

      {/* Content Layer */}
      <div className="container mx-auto px-4 relative z-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/40 border border-white/60 backdrop-blur-sm mb-8 animate-fade-in shadow-soft">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/60">
              Michelin Inspired Experience
            </span>
          </div>
          
          <h1 className="font-display text-6xl md:text-9xl font-bold text-foreground leading-[0.9] mb-10 animate-slide-up mt-[15px]" style={{ animationDelay: '0.1s' }}>
            Pure <span className="text-primary italic font-light italic-font">Culinary</span> <br />
            <span className="relative">
              Artistry
              <svg className="absolute -bottom-4 left-0 w-full h-4 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-14 font-medium leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Where technique meets passion. Step into a world of curated flavors and serene ambiance designed for the modern connoisseur.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/menu">
              <Button variant="hero" size="xl" className="px-12 py-9 rounded-3xl text-lg shadow-premium hover:scale-105 transition-transform bg-primary text-white border-none">
                Explore The Menu
              </Button>
            </Link>
            <Link to="/booking">
              <Button
                variant="outline"
                size="xl"
                className="px-12 py-9 rounded-3xl text-lg glass border-primary/20 text-primary hover:bg-primary/5 transition-all font-bold"
              >
                Book Your Table
              </Button>
            </Link>
          </div>
          
          {/* Trust Badge */}
          <div className="mt-20 flex items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-2xl border-4 border-background overflow-hidden shadow-soft transform rotate-6">
                  <img src={`https://i.pravatar.cc/150?u=${i+20}`} alt="User" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">Trusted By</p>
              <p className="text-sm font-bold text-foreground/80 lowercase">5k+ gourmets globally</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image Mockup - Visual Parallax */}
      <div className="absolute right-[-5%] bottom-[-5%] w-[40%] h-[40%] z-10 hidden xl:block animate-float">
         <img 
            src="/src/assets/hero.png" 
            alt="Signature Experience" 
            className="w-full h-full object-cover rounded-[4rem] shadow-premium transform -rotate-6 border-[1rem] border-white/40"
         />
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent z-20" />
    </section>
  );
};

export default HeroSection;
