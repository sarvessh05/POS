import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Check, Lock, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CaptainLogin = () => {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNumberClick = (num: number) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = async () => {
    if (pin.length !== 6) return;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase
        .from('captains')
        .select('*')
        .eq('pin', pin)
        .single();

      if (error || !data) {
        throw new Error('Invalid PIN');
      }

      // Store captain session
      localStorage.setItem('captain_session', JSON.stringify(data));
      
      toast({
        title: `Welcome, ${data.name}! 👋`,
        description: "You are now logged in as a Captain.",
      });
      
      navigate('/captain');
    } catch (e: any) {
      toast({
        title: "Login Failed",
        description: "Incorrect PIN. Please try again.",
        variant: "destructive"
      });
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 sm:p-12 font-sans selection:bg-primary/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mb-12">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-premium">
                <Star className="w-10 h-10 text-primary fill-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-2">Captain Portal</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Enter your 6-digit PIN to access orders</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-12">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        scale: pin.length === i ? 1.1 : 1,
                        borderColor: pin.length > i ? '#f5c22c' : '#1e293b'
                    }}
                    className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center bg-slate-800/50 backdrop-blur-xl transition-all duration-300`}
                >
                    <AnimatePresence>
                        {pin.length > i && (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(245,194,44,0.5)]"
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>

        {/* Dial Pad */}
        <div className="grid grid-cols-3 gap-4 mb-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <motion.button
                    key={num}
                    whileTap={{ scale: 0.9, backgroundColor: 'rgba(245,194,44,0.1)' }}
                    onClick={() => handleNumberClick(num)}
                    className="h-20 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-2xl font-bold text-white hover:border-primary/30 transition-all flex items-center justify-center"
                >
                    {num}
                </motion.button>
            ))}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="h-20 rounded-2xl bg-slate-800/20 text-slate-400 flex items-center justify-center"
            >
                <Delete className="w-6 h-6" />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNumberClick(0)}
                className="h-20 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-2xl font-bold text-white flex items-center justify-center"
            >
                0
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={pin.length !== 6 || isVerifying}
                onClick={handleLogin}
                className={`h-20 rounded-2xl flex items-center justify-center transition-all ${pin.length === 6 ? 'bg-primary text-slate-900' : 'bg-slate-800/20 text-slate-600'}`}
            >
                {isVerifying ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Lock className="w-6 h-6" />
                    </motion.div>
                ) : (
                    <Check className="w-8 h-8 font-bold" />
                )}
            </motion.button>
        </div>

        <div className="flex flex-col gap-4">
            <Button variant="ghost" className="text-slate-500 text-xs hover:text-white" onClick={() => navigate('/')}>
                Back to Site
            </Button>
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em]">Authorized Access Only</p>
        </div>
      </motion.div>
    </div>
  );
};

export default CaptainLogin;
