import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For now, allow any login for dev testing, or check against mock
    setTimeout(() => {
        setIsLoading(false);
        toast.success("Welcome back, Admin!");
        navigate('/admin');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center p-6 bg-[grid-slate-200] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] bg-[length:20px_20px]">
      <Card className="w-full max-w-md rounded-[2.5rem] border-foreground/5 shadow-premium overflow-hidden bg-white/80 backdrop-blur-xl">
        <CardHeader className="pt-12 pb-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow mb-6">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="font-display text-3xl font-black text-foreground tracking-tight">
            Management Portal
          </CardTitle>
          <CardDescription className="font-medium text-foreground/40 mt-2">
            Secure access for restaurant administrators
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-12">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
               <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Admin Email" 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-foreground/5 bg-slate-50/50 focus:bg-white transition-all font-medium"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Authentication Key" 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-foreground/5 bg-slate-50/50 focus:bg-white transition-all font-medium"
                  />
               </div>
            </div>

            <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-foreground text-white hover:bg-primary hover:shadow-glow transition-all font-bold group"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                    <>
                        <span>Enter Dashboard</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-foreground/5">
             <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black uppercase text-[10px] tracking-widest gap-2"
                onClick={() => navigate('/admin')}
             >
                <ShieldCheck className="w-4 h-4" />
                Dev Mode: Instant Access
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
