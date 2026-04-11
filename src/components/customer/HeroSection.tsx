import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop"
          alt="Restaurant ambiance"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-md border border-background/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Star className="w-4 h-4 fill-gold text-gold" />
            <span className="text-sm text-background/90">4.9 Rating · 2000+ Reviews</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-background mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Experience the Art of
            <span className="block text-primary">Fine Dining</span>
          </h1>

          <p className="text-lg text-background/80 mb-8 max-w-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Savor authentic flavors crafted with passion. From traditional recipes to modern interpretations, every dish tells a story.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/menu">
              <Button variant="hero" size="xl" className="gap-2">
                Order Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/booking">
              <Button
                variant="outline"
                size="xl"
                className="border-background/30 text-background hover:bg-background/10 hover:text-background"
              >
                Book a Table
              </Button>
            </Link>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 text-background/80">
              <Clock className="w-5 h-5" />
              <span className="text-sm">11 AM - 11 PM</span>
            </div>
            <div className="flex items-center gap-2 text-background/80">
              <MapPin className="w-5 h-5" />
              <span className="text-sm">123 Food Street, Downtown</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
