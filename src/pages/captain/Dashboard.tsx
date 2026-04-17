import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  LogOut, 
  User, 
  Table as TableIcon,
  ChefHat,
  Bell,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCaptainOrders, useGenerateKOT, useMarkServed, useFinishTable, useResetTable } from '@/hooks/useDatabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CaptainDashboard = () => {
  const [captain, setCaptain] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: tables, isLoading, refetch } = useCaptainOrders();
  const { mutateAsync: generateKOT } = useGenerateKOT();
  const { mutateAsync: markServed } = useMarkServed();
  const { mutateAsync: finishTable } = useFinishTable();
  const { mutateAsync: resetTable } = useResetTable();

  const [notificationSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  const [printData, setPrintData] = useState<any>(null);

  const handlePrintKOT = (order: any, tableNumber: number) => {
    setPrintData({ order, tableNumber });
    setTimeout(() => {
        window.print();
        setPrintData(null);
    }, 100);
  };

  useEffect(() => {
    const session = localStorage.getItem('captain_session');
    if (!session) {
      navigate('/login-captain');
    } else {
      setCaptain(JSON.parse(session));
    }

    // Subscribe to new orders for notification sound
    const channel = supabase
      .channel('captain_realtime')
      .on('postgres_changes', { event: 'INSERT', table: 'orders' }, () => {
        notificationSound.play().catch(e => console.log('Audio play failed', e));
        refetch();
      })
      .on('postgres_changes', { event: 'UPDATE', table: 'tables' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('captain_session');
    navigate('/login-captain');
  };

  if (isLoading || !captain) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Coffee className="w-10 h-10 text-primary" />
        </motion.div>
    </div>
  );

  const activeTables = tables?.filter(t => t.status !== 'available') || [];
  const billingTables = activeTables.filter(t => t.status === 'billing');
  const requestBillTables = activeTables.filter(t => t.status === 'request_bill');

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h1 className="text-md font-black uppercase tracking-tight leading-none text-slate-900">Captain's Desk</h1>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest flex items-center gap-1">
                    <User className="w-2 h-2" /> {captain.name}
                </p>
            </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
            <LogOut className="w-4 h-4" />
        </Button>
      </header>

      <main className="p-4 max-w-5xl mx-auto space-y-6">
        
        {/* Bill Requests - Priority */}
        <AnimatePresence>
            {(requestBillTables.length > 0 || billingTables.length > 0) && (
                <motion.section 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-orange-500 animate-bounce" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Payment & Checkout</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {requestBillTables.map(t => (
                            <motion.div key={t.id} className="bg-orange-50 border border-orange-200 rounded-3xl p-5 flex items-center justify-between shadow-sm">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest block mb-1">Bill Requested</span>
                                    <h3 className="text-2xl font-black text-slate-900">TABLE {t.number}</h3>
                                </div>
                                <Button 
                                    className="bg-orange-500 hover:bg-orange-600 rounded-2xl h-12 px-6 font-bold gap-2"
                                    onClick={() => finishTable(t.id)}
                                >
                                    <Printer className="w-4 h-4" />
                                    Generate Bill
                                </Button>
                            </motion.div>
                        ))}
                        {billingTables.map(t => (
                            <motion.div key={t.id} className="bg-green-50 border border-green-200 rounded-3xl p-5 flex items-center justify-between shadow-sm">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-green-600 tracking-widest block mb-1">Billing In Progress</span>
                                    <h3 className="text-2xl font-black text-slate-900">TABLE {t.number}</h3>
                                </div>
                                <Button 
                                    variant="outline"
                                    className="border-green-200 text-green-700 bg-white hover:bg-green-100 rounded-2xl h-12 px-6 font-bold gap-2"
                                    onClick={() => resetTable(t.id)}
                                >
                                    <Check className="w-4 h-4" />
                                    Mark as Paid
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}
        </AnimatePresence>

        {/* Section: New Orders (Pending KOT) */}
        <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Preparation Pending</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Oldest First</span>
            </div>

            <div className="space-y-4">
                {tables?.filter(t => t.orders?.some((o: any) => !o.kot_generated_at)).map(table => (
                    <div key={table.id} className="space-y-3">
                        {table.orders?.filter((o: any) => !o.kot_generated_at).map((order: any) => (
                             <motion.div 
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group"
                             >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[2px_0_10px_rgba(245,194,44,0.3)]" />
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                                            <span className="text-[10px] font-black text-slate-300 uppercase leading-none">Table</span>
                                            <span className="text-2xl font-black text-slate-900">{table.number}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900">ORDER #{order.id.slice(-4).toUpperCase()}</h4>
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">New</span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium mt-1">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Just now</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline"
                                            className="rounded-2xl h-12 px-4 shadow-soft font-bold text-[10px] uppercase tracking-widest gap-2"
                                            onClick={() => handlePrintKOT(order, table.number)}
                                        >
                                            <Printer className="w-4 h-4" />
                                            Live Print
                                        </Button>
                                        <Button 
                                            className="rounded-2xl h-12 px-4 sm:px-8 font-black uppercase tracking-widest text-[10px] sm:text-xs gap-2 sm:gap-3 shadow-premium"
                                            onClick={() => generateKOT(order.id)}
                                        >
                                            <Check className="w-4 h-4" />
                                            <span className="hidden xs:inline">Approve & Print</span>
                                            <span className="xs:hidden">Approve</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {order.order_items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                                                    <span className="font-black text-primary text-sm">{item.quantity}</span>
                                                </div>
                                                <span className="font-bold text-slate-600">{item.menu_items?.name}</span>
                                            </div>
                                            {item.instructions && (
                                              <span className="text-[10px] bg-white px-2 py-1 rounded-md text-slate-400 border italic italic-font font-medium">"{item.instructions}"</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                             </motion.div>
                        ))}
                    </div>
                ))}
                {activeTables.filter(t => t.orders?.some((o: any) => !o.kot_generated_at)).length === 0 && (
                  <div className="py-20 text-center space-y-4 opacity-30 grayscale pointer-events-none">
                      <Coffee className="w-12 h-12 mx-auto text-slate-400" />
                      <p className="text-xs font-black uppercase tracking-[0.4em]">All orders cleared</p>
                  </div>
                )}
            </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4 py-4">
            <span className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">KOT Already Printed</span>
            </div>
            <span className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Section: Printed Orders (Pending Service) */}
        <section className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tables?.map(table => (
                    table.orders?.filter((o: any) => o.kot_generated_at && o.status !== 'served').map((order: any) => (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col justify-between shadow-soft hover:shadow-premium transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 font-black text-slate-900 text-lg">
                                        {table.number}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Order #{order.id.slice(-4).toUpperCase()}</h4>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <AlertCircle className="w-3 h-3 text-green-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Printed {new Date(order.kot_generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {order.order_items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400">{item.quantity}x</span>
                                        <span className="text-xs text-slate-600 font-medium">{item.menu_items?.name}</span>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                variant="outline"
                                onClick={() => markServed(order.id)}
                                className="w-full rounded-xl border-slate-100 text-slate-500 hover:bg-primary/5 hover:text-primary hover:border-primary/20 flex items-center justify-between px-5 font-bold text-xs"
                            >
                                <span>Mark as Served</span>
                                <ChevronRight className="w-4 h-4 animate-pulse" />
                            </Button>
                        </motion.div>
                    ))
                )).flat()}
             </div>
             {activeTables.filter(t => t.orders?.some((o: any) => o.kot_generated_at && o.status !== 'served')).length === 0 && (
                <div className="py-12 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No printed orders pending</p>
                </div>
             )}
        </section>

      </main>

      {/* Footer / Quick Stats */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 flex justify-around items-center z-40">
        <div className="text-center">
            <p className="text-xs font-black text-slate-900">{activeTables.length}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Tables</p>
        </div>
        <div className="h-6 w-px bg-slate-100" />
        <div className="text-center">
            <p className="text-xs font-black text-slate-900">{requestBillTables.length}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Bill Requests</p>
        </div>
        <div className="h-6 w-px bg-slate-100" />
        <div className="text-center">
            <p className="text-xs font-black text-slate-900">{billingTables.length}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">In Checkout</p>
        </div>
      </footer>

      {/* Hidden Printable KOT */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 font-mono text-black">
        {printData && (
          <div className="max-w-[300px] mx-auto border-2 border-black p-4">
            <h2 className="text-xl font-bold text-center border-b-2 border-dashed border-black pb-2 mb-4 uppercase">KITCHEN ORDER</h2>
            <div className="space-y-1 mb-4 text-sm">
                <p className="flex justify-between"><span>TABLE NO:</span> <span className="font-black text-lg">{printData.tableNumber}</span></p>
                <p className="flex justify-between"><span>ORDER ID:</span> <span>#{printData.order.id.slice(-4).toUpperCase()}</span></p>
                <p className="flex justify-between"><span>TIME:</span> <span>{new Date(printData.order.created_at).toLocaleTimeString()}</span></p>
            </div>
            <div className="border-b border-black mb-4" />
            <div className="space-y-3 mb-6">
                {printData.order.order_items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col">
                        <div className="flex justify-between items-start">
                            <span className="font-bold">{item.quantity} x {item.menu_items?.name}</span>
                        </div>
                        {item.instructions && (
                            <span className="text-[10px] ml-4 italic border-l border-black pl-2 mt-1">Note: {item.instructions}</span>
                        )}
                    </div>
                ))}
            </div>
            <div className="border-b border-black mb-4" />
            <p className="text-center text-[10px] font-bold uppercase tracking-widest">--- End of KOT ---</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptainDashboard;
