import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitRating } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

interface RatingFlowProps {
  orderedDishes: any[];
  onComplete: () => void;
  onSkip: () => void;
}

const RatingFlow = ({ orderedDishes, onComplete, onSkip }: RatingFlowProps) => {
  // Group dishes by ID so we only rate each unique dish once
  const uniqueDishesToRate = Array.from(new Map(
    orderedDishes.map(d => [d.id, d])
  ).values());
  
  const [step, setStep] = useState<'intro' | 'rating' | 'thank_you'>('intro');
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const { mutateAsync: submitRatings } = useSubmitRating();
  const { toast } = useToast();

  const currentDish = uniqueDishesToRate[currentDishIndex];

  const handleRate = (rating: number) => {
    setRatings(prev => ({ ...prev, [currentDish.id]: rating }));
    
    // Auto-advance or finish
    setTimeout(() => {
      if (currentDishIndex < uniqueDishesToRate.length - 1) {
        setCurrentDishIndex(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }, 400);
  };

  const handleSubmit = async () => {
    try {
      const ratingData = Object.entries(ratings).map(([dish_id, rating]) => ({
        dish_id,
        order_id: uniqueDishesToRate.find(d => d.id === dish_id)?.order_id,
        rating,
      }));

      await submitRatings(ratingData);
      setStep('thank_you');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit ratings:', error);
      toast({
        title: "Error",
        description: "Failed to submit ratings. Please try again.",
        variant: "destructive"
      });
      onSkip(); // Proceed to bill anyway on error
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-6 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="max-w-md w-full text-center"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Star className="w-12 h-12 text-primary fill-primary" />
            </div>
            <h2 className="font-display text-4xl font-bold mb-4">
              How was your experience?
            </h2>
            <p className="text-muted-foreground mb-12 italic">
              Your feedback helps us cook better stories for you.
            </p>
            
            <div className="space-y-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full h-16 rounded-2xl text-lg font-bold"
                onClick={() => setStep('rating')}
              >
                Yes, Rate Dishes
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full h-16 rounded-2xl text-muted-foreground underline"
                onClick={onSkip}
              >
                Skip to Bill
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'rating' && (
          <motion.div 
            key="rating"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/30">
                Dish {currentDishIndex + 1} of {uniqueDishesToRate.length}
              </span>
              <button 
                onClick={onSkip}
                className="text-foreground/30 hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <motion.div 
              key={currentDish.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-[3rem] p-8 shadow-premium border border-white flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="w-48 h-48 rounded-full border-[8px] border-white shadow-premium overflow-hidden mb-8">
                <img 
                  src={currentDish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'} 
                  alt={currentDish.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-display text-3xl font-bold mb-2">
                {currentDish.name}
              </h3>
              <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest mb-10">
                Rate this dish
              </p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRate(star)}
                    className="p-1"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        (ratings[currentDish.id] || 0) >= star 
                          ? 'text-primary fill-primary' 
                          : 'text-foreground/10 fill-none'
                      } transition-colors`}
                    />
                  </motion.button>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-foreground/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentDishIndex + 1) / uniqueDishesToRate.length) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === 'thank_you' && (
          <motion.div 
            key="thank_you"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="font-display text-4xl font-bold mb-4">
              Thank You!
            </h2>
            <p className="text-muted-foreground">
              Generating your bill...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RatingFlow;
