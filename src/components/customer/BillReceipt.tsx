import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Check, ChevronDown, ChevronUp, Share2, CreditCard, Banknote, Heart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface BillReceiptProps {
  items: any[];
  subtotal: number;
  taxConfig: {
    gst_rate: number;
    service_charge_rate: number;
  };
  onClose: () => void;
  onPaid: () => void;
}

const BillReceipt = ({ items, subtotal, taxConfig, onClose, onPaid }: BillReceiptProps) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [splitCount, setSplitCount] = useState(1);
  const [tip, setTip] = useState(0);
  const [step, setStep] = useState<'billing' | 'payment' | 'success'>('billing');

  const gst = Math.round(subtotal * (taxConfig.gst_rate / 100));
  const serviceCharge = Math.round(subtotal * (taxConfig.service_charge_rate / 100));
  const grandTotal = subtotal + gst + serviceCharge + tip;

  const handlePayment = () => {
    setStep('success');
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#f5c22c', '#10b981', '#ffffff']
    });
    setTimeout(() => {
        onPaid();
    }, 3000);
  };

  const receiptVariants = {
    hidden: { y: 500, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 200,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-6"
    >
      <AnimatePresence mode="wait">
        {step === 'billing' && (
          <motion.div
            key="billing"
            variants={receiptVariants}
            initial="hidden"
            animate="visible"
            exit={{ y: 500, opacity: 0 }}
            className="w-full max-w-md bg-[#fdfcf0] rounded-t-[2rem] sm:rounded-[2rem] shadow-premium overflow-hidden relative"
          >
            {/* Torn Edge Top */}
            <div className="h-4 bg-repeat-x" style={{ backgroundImage: 'radial-gradient(circle at 10px -5px, transparent 12px, #fdfcf0 13px)', backgroundSize: '20px 20px' }} />
            
            <div className="p-8 pt-4">
              {/* Receipt Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/10">
                  <Receipt className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight">FLAVOR HAVEN</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mt-1">Gourmet Dining Experience</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="w-8 h-px bg-foreground/10" />
                    <span className="text-[10px] font-bold text-foreground/20">ORDER #8829</span>
                    <span className="w-8 h-px bg-foreground/10" />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-8">
                {items.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    variants={itemVariants}
                    className="flex justify-between items-center"
                  >
                    <div className="flex gap-3 items-center">
                       <span className="text-[10px] font-black text-primary bg-primary/5 w-6 h-6 rounded flex items-center justify-center">
                         {item.quantity}x
                       </span>
                       <span className="font-bold text-sm text-foreground/80">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm">₹{item.price * item.quantity}</span>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-dashed border-foreground/10 pt-6 mb-6">
                <button 
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex justify-between items-center text-xs font-black uppercase tracking-widest text-foreground/40 mb-4 hover:text-primary transition-colors"
                >
                  <span>Tax & Charges Breakdown</span>
                  {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3 mb-4"
                    >
                      <div className="flex justify-between text-sm text-foreground/60">
                        <span>Subtotal</span>
                        <span className="font-mono">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-foreground/60">
                        <span>GST ({taxConfig.gst_rate}%)</span>
                        <span className="font-mono">₹{gst}</span>
                      </div>
                      <div className="flex justify-between text-sm text-foreground/60">
                        <span>Service Charge ({taxConfig.service_charge_rate}%)</span>
                        <span className="font-mono">₹{serviceCharge}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-end">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Amount to Pay</span>
                      <span className="font-display text-4xl font-black text-primary">₹{grandTotal}</span>
                   </div>
                   {splitCount > 1 && (
                     <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Custom Split</span>
                        <span className="font-display text-xl font-bold text-primary/60">₹{Math.round(grandTotal / splitCount)} <span className="text-xs">each</span></span>
                     </div>
                   )}
                </div>
              </div>

              {/* Tip Selector */}
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-3 block">Add a little love (Tip)</span>
                <div className="flex gap-2">
                   {[0, 10, 20, 50, 100].map((val) => (
                     <motion.button
                       key={val}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setTip(val)}
                       className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${tip === val ? 'bg-primary border-primary text-white shadow-soft' : 'bg-white border-foreground/5 text-foreground/40 hover:border-primary/20'}`}
                     >
                       {val === 0 ? 'No' : `₹${val}`}
                     </motion.button>
                   ))}
                </div>
              </div>

              {/* Split Bill controls */}
              <div className="mb-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-xs font-bold leading-none">Split Bill</p>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider mt-1">{splitCount} People</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button 
                        variant="soft" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-soft"
                        onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-display font-bold text-lg">{splitCount}</span>
                    <Button 
                        variant="soft" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-soft"
                        onClick={() => setSplitCount(Math.min(10, splitCount + 1))}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                 </div>
              </div>

              {/* Visual Split Indicator on Receipt */}
              <AnimatePresence>
                {splitCount > 1 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between"
                    >
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-green-600/60 tracking-widest">Individual Share</p>
                            <p className="font-display text-2xl font-black text-green-600">₹{Math.round(grandTotal / splitCount)}</p>
                        </div>
                        <Check className="w-6 h-6 text-green-600/30" />
                    </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <Button 
                    className="w-full h-16 rounded-2xl text-lg font-bold gap-3 shadow-premium"
                    onClick={() => setStep('payment')}
                >
                    <CreditCard className="w-6 h-6" />
                    Proceed to Payment
                </Button>
                <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-xl text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em]"
                    onClick={onClose}
                >
                    Order More Dishes
                </Button>
              </div>

              <div className="mt-8 text-center opacity-20 pointer-events-none">
                 <div className="flex justify-center gap-4 mb-2">
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                 </div>
                 <p className="font-mono text-[8px]">SCAN FOR DIGITAL RECEIPT • NO REFUNDS</p>
              </div>
            </div>

            {/* Torn Edge Bottom */}
            <div className="h-4 bg-repeat-x rotate-180" style={{ backgroundImage: 'radial-gradient(circle at 10px -5px, transparent 12px, #fdfcf0 13px)', backgroundSize: '20px 20px' }} />
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-premium border border-white text-center"
          >
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <CreditCard className="w-10 h-10 text-primary" />
             </div>
             <h2 className="font-display text-2xl font-bold mb-2">Choose Method</h2>
             <p className="text-muted-foreground mb-8 text-sm">Table #04 • Total ₹{grandTotal}</p>
             
             <div className="space-y-4">
                <motion.div 
                    initial={false}
                    animate={{ height: 'auto' }}
                    className="overflow-hidden"
                >
                    <button 
                        onClick={() => setStep('payment')}
                        className="w-full h-20 rounded-2xl flex flex-col items-center justify-center p-0 gap-1 bg-[#22c55e] hover:bg-[#16a34a] border-none text-white relative group"
                    >
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-lg">Pay via UPI</span>
                        </div>
                        <span className="text-[10px] opacity-60 uppercase font-black tracking-widest">Fixed QR Scanner</span>
                    </button>
                    
                    {/* Fixed QR Display for UPI */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-6 bg-white border-2 border-dashed border-green-500/20 rounded-3xl"
                    >
                        <div className="aspect-square w-full max-w-[180px] mx-auto bg-foreground/5 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                           <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=restaurant@upi&pn=FlavorHaven&am=${grandTotal}`}
                            alt="UPI QR Code"
                            className="w-full h-full p-2"
                           />
                           <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[10px] font-black uppercase text-green-600">Scan to Pay</span>
                           </div>
                        </div>
                        <p className="text-[10px] text-foreground/40 font-bold mt-4 uppercase tracking-widest">Scan with GPay, PhonePe, or Paytm</p>
                        
                        <Button 
                            variant="secondary"
                            onClick={handlePayment}
                            className="w-full mt-4 rounded-xl bg-green-50 text-green-600 border-none hover:bg-green-100 font-bold"
                        >
                            I've Paid Successfully
                        </Button>
                    </motion.div>
                </motion.div>

                <div className="h-px bg-foreground/5 my-2" />
                
                <Button 
                    variant="outline"
                    onClick={handlePayment}
                    className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 border-foreground/10 hover:bg-foreground/5 text-foreground/60"
                >
                    <Banknote className="w-5 h-5" />
                    <span className="font-bold">Pay via Cash at Counter</span>
                </Button>
                
                <Button 
                    variant="ghost"
                    onClick={() => setStep('billing')}
                    className="w-full h-12 text-muted-foreground underline"
                >
                    Go Back
                </Button>
             </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-premium border-[8px] border-white">
                    <Check className="w-16 h-16 text-white" />
                </div>
            </div>
            <h2 className="font-display text-5xl font-bold text-white mb-4">You're All Set!</h2>
            <p className="text-white/60 text-lg italic font-light italic-font">We hope you loved the flavors as much as we loved serving them.</p>
            <div className="mt-12 flex items-center justify-center gap-2 text-white/40">
                <Heart className="w-4 h-4 fill-white/20 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">See you again soon</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BillReceipt;
