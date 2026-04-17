import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTable } from '@/contexts/TableContext';
import { Loader2, AlertCircle, Sparkles, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DinePage = () => {
  const { qr_token } = useParams<{ qr_token: string }>();
  const navigate = useNavigate();
  const { setSession } = useTable();
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!qr_token) {
        setError('Invalid QR Code. Please scan a valid table QR.');
        setIsValidating(false);
        return;
      }

      try {
        const { data: table, error: supabaseError } = await supabase
          .from('tables')
          .select('id, number')
          .eq('qr_token', qr_token)
          .single();

        if (supabaseError || !table) {
          setError('This table session is invalid or has expired.');
          setIsValidating(false);
          return;
        }

        // Bind table to session
        setSession({
          tableId: table.id,
          tableNumber: table.number,
          qrToken: qr_token,
        });

        // Small delay for smooth transition
        setTimeout(() => {
          navigate('/menu', { replace: true });
        }, 1500);

      } catch (err) {
        console.error('QR Validation Error:', err);
        setError('Something went wrong. Please try scanning again.');
        setIsValidating(false);
      }
    };

    validateToken();
  }, [qr_token, setSession, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full glass rounded-[2rem] p-10 text-center animate-scale-in border-white shadow-premium">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-destructive/20 shadow-soft">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Oops!
          </h1>
          <p className="text-foreground/60 leading-relaxed mb-8">
            {error}
          </p>
          <Button 
            variant="hero" 
            className="w-full h-14 rounded-2xl shadow-premium font-bold uppercase tracking-widest text-[10px]"
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-premium flex items-center justify-center border border-white/60">
            <ChefHat className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2">
            <div className="bg-primary p-2 rounded-xl shadow-soft animate-bounce">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <h2 className="font-display text-4xl font-bold text-foreground mb-6 text-center animate-slide-up">
          Welcome to <br />
          <span className="text-primary italic font-light italic-font">Flavor Haven</span>
        </h2>
        
        <div className="flex flex-col items-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/60 border border-white shadow-soft backdrop-blur-sm">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground tracking-wide">
              Identifying your table...
            </span>
          </div>
          <p className="text-foreground/40 text-[10px] uppercase tracking-[0.2em] font-bold">
            Almost Ready
          </p>
        </div>
      </div>
    </div>
  );
};

export default DinePage;
