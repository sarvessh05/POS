import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative group">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-premium relative z-10 border-[1rem] border-white/40 transform group-hover:-rotate-2 transition-transform duration-700">
              <img
                src="https://images.unsplash.com/photo-1550966842-286e5f84623c?auto=format&fit=crop&q=80&w=800"
                alt="Our Restaurant Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-[2.5rem] overflow-hidden shadow-premium z-20 hidden xl:block border-[1rem] border-white/60 transform rotate-6 group-hover:rotate-12 transition-transform duration-700">
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=500"
                alt="Chef at work"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating Element */}
            <div className="absolute top-1/2 left-[-10%] w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10 animate-float" />
          </div>

          <div className="lg:pl-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
               Our Heritage
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-10 leading-[1.05] tracking-tight">
              A Symphony of <br />
              <span className="text-primary italic font-light italic-font underline decoration-primary/10 decoration-8 underline-offset-4 font-playfair">Flavors & Soul</span>
            </h2>
            
            <div className="space-y-8 text-lg text-foreground/60 leading-relaxed font-medium">
              <p>
                Spice Haven isn't just a kitchen; it's a legacy. Since 1998, we've curated an atmosphere where every meal is a conversation and every flavor tells a story of tradition meeting modernity.
              </p>
              <p>
                We source our ingredients from the heart of our land, partnering with local artisans who share our obsession with quality and soul-stirring freshness.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 items-center pt-10 border-t border-primary/10">
              <div>
                <span className="block text-4xl font-display font-bold text-primary mb-2">25</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-tight block">Years of <br /> Excellence</span>
              </div>
              <div>
                <span className="block text-4xl font-display font-bold text-primary mb-2">08</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-tight block">Global <br /> Accolades</span>
              </div>
              <div>
                <span className="block text-4xl font-display font-bold text-primary mb-2">12</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-tight block">Elite <br /> Visionaries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
