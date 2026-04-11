import { Button } from '@/components/ui/button';
import { Gift, Percent, Clock } from 'lucide-react';

const offers = [
  {
    id: '1',
    title: '20% Off on First Order',
    description: 'Use code WELCOME20 at checkout',
    icon: Gift,
    gradient: 'from-primary to-terracotta-dark',
  },
  {
    id: '2',
    title: 'Happy Hours Special',
    description: 'Flat 15% off between 3-6 PM',
    icon: Clock,
    gradient: 'from-sage to-secondary-foreground',
  },
  {
    id: '3',
    title: 'Weekend Biryani Fest',
    description: 'Buy 1 Get 1 on all Biryanis',
    icon: Percent,
    gradient: 'from-gold to-primary',
  },
];

const OffersSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Special Offers
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Deals You Can't Miss
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${offer.gradient} text-background animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative z-10">
                <offer.icon className="w-10 h-10 mb-4 opacity-90" />
                <h3 className="font-display text-2xl font-bold mb-2">
                  {offer.title}
                </h3>
                <p className="text-background/80 mb-4">{offer.description}</p>
                <Button
                  variant="outline"
                  className="border-background/30 text-background hover:bg-background/20 hover:text-background"
                >
                  Claim Offer
                </Button>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-background/10 rounded-full" />
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-background/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
