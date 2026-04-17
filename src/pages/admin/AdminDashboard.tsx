import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStats } from '@/hooks/useDatabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  ShoppingBag, DollarSign, Users, TrendingUp, Clock, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter, Calendar,
  PieChart as PieIcon, Activity, Flame, Award, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Printer as PrintIcon, FileText } from 'lucide-react';

// --- MOCK DATA FOR CHARTS ---
const revenueData = [
  { day: 'Mon', revenue: 12000, orders: 45 },
  { day: 'Tue', revenue: 19000, orders: 52 },
  { day: 'Wed', revenue: 15000, orders: 48 },
  { day: 'Thu', revenue: 22000, orders: 61 },
  { day: 'Fri', revenue: 35000, orders: 89 },
  { day: 'Sat', revenue: 48000, orders: 112 },
  { day: 'Sun', revenue: 42000, orders: 95 },
];

const categoryData = [
  { name: 'Entrees', value: 40, color: '#f5c22c' },
  { name: 'Mains', value: 35, color: '#f26e4f' },
  { name: 'Drinks', value: 15, color: '#5eb592' },
  { name: 'Desserts', value: 10, color: '#8b5cf6' },
];

const peakHoursData = [
  { hour: '12 PM', count: 40 },
  { hour: '1 PM', count: 65 },
  { hour: '2 PM', count: 30 },
  { hour: '3 PM', count: 15 },
  { hour: '4 PM', count: 12 },
  { hour: '5 PM', count: 25 },
  { hour: '6 PM', count: 50 },
  { hour: '7 PM', count: 85 },
  { hour: '8 PM', count: 110 },
  { hour: '9 PM', count: 95 },
  { hour: '10 PM', count: 45 },
];

const topDishes = [
  { name: 'Signature Butter Chicken', sold: 450, growth: '+12%', color: 'bg-primary' },
  { name: 'Paneer Tikka Platter', sold: 320, growth: '+8%', color: 'bg-gold' },
  { name: 'Dal Makhani Gold', sold: 280, growth: '+15%', color: 'bg-sage' },
  { name: 'Garlic Butter Naan', sold: 850, growth: '+22%', color: 'bg-terracotta' },
  { name: 'Mango Lassi Premium', sold: 210, growth: '-2%', color: 'bg-blue-400' },
];

const StatCard = ({ title, value, change, isPositive, icon: Icon, color }: any) => (
  <div className="bg-white rounded-3xl p-6 shadow-soft border border-foreground/5 relative overflow-hidden group hover:shadow-premium transition-all duration-500">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-sage' : 'text-destructive'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-1">{title}</p>
      <h3 className="text-3xl font-display font-black text-foreground">{value}</h3>
    </div>
    <div className="mt-4 h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} w-[70%] rounded-full`} />
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrintReport = () => {
    setIsGenerating(true);
    toast({
        title: "Generating Report",
        description: "Preparing your daily business summary PDF...",
    });
    
    setTimeout(() => {
        window.print();
        setIsGenerating(false);
    }, 1000);
  };

  if (isLoading) {
    return (
        <AdminLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-display text-xl font-bold text-slate-300 uppercase tracking-widest">Crunching performance data...</p>
            </div>
        </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display text-4xl font-black text-foreground tracking-tight">Executive Summary</h1>
            <p className="text-foreground/40 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Flavor Haven • Performance Analytics Portal</p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                className="rounded-2xl border-foreground/10 h-12 px-6 gap-2 hover:bg-white hover:shadow-soft transition-all"
                onClick={handlePrintReport}
                disabled={isGenerating}
             >
                <PrintIcon className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                <span>{isGenerating ? 'Preparing...' : 'Generate Report'}</span>
             </Button>
             <Button variant="hero" className="rounded-2xl h-12 px-6 gap-2 shadow-premium">
                <FileText className="w-4 h-4" />
                <span>Export PDF</span>
             </Button>
          </div>
        </div>

        {/* Top Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats?.totalRevenue.toLocaleString()}`} 
            change="+14.2%" 
            isPositive={true} 
            icon={DollarSign} 
            color="bg-[#f26e4f]" 
          />
          <StatCard 
            title="Total Orders" 
            value={stats?.orderCount.toString()} 
            change="+8.1%" 
            isPositive={true} 
            icon={ShoppingBag} 
            color="bg-[#f5c22c]" 
          />
          <StatCard 
            title="Active Tables" 
            value={`${stats?.activeTables}/24`} 
            change="Live Status" 
            isPositive={true} 
            icon={Users} 
            color="bg-[#5eb592]" 
          />
          <StatCard 
            title="Average Prep Time" 
            value={stats?.avgPrepTime} 
            change="-2.4m" 
            isPositive={true} 
            icon={Clock} 
            color="bg-[#8b5cf6]" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-foreground/5">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="font-display text-2xl font-black text-foreground">Revenue Trend</h3>
                        <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mt-1">Weekly Earnings vs Orders</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-black uppercase text-primary">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                            <span className="text-[10px] font-black uppercase text-slate-500">Orders</span>
                        </div>
                    </div>
                </div>
                
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f26e4f" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#f26e4f" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                            />
                            <Tooltip 
                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                                itemStyle={{fontWeight: 800}}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#f26e4f" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Peak Hours */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-foreground/5">
                  <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                     <Activity className="w-5 h-5 text-primary" />
                     Peak Business Hours
                  </h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peakHoursData}>
                            <Bar dataKey="count" fill="#f5c22c" radius={[4, 4, 0, 0]} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <XAxis dataKey="hour" hide />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                     <span>Morning</span>
                     <span>Evening Rush</span>
                     <span>Closing</span>
                  </div>
               </div>

               {/* Item Breakdown */}
               <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-foreground/5 flex flex-col items-center">
                  <h3 className="font-display text-xl font-bold mb-2 self-start">Category Share</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                     {categoryData.map(c => (
                        <div key={c.name} className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{backgroundColor: c.color}} />
                           <span className="text-[10px] font-black uppercase text-foreground/50">{c.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Top Dishes */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-foreground/5">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-display text-xl font-bold flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Best Sellers
                    </h3>
                    <Award className="w-5 h-5 text-gold opacity-30" />
                </div>
                <div className="space-y-6">
                    {topDishes.map((dish, i) => (
                        <div key={dish.name} className="group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-tighter">Ranking #{i+1}</span>
                                    <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors">{dish.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-foreground">{dish.sold}</span>
                                    <span className="block text-[8px] font-bold text-sage">{dish.growth}</span>
                                </div>
                            </div>
                            <Progress value={dish.name === 'Garlic Butter Naan' ? 100 : (dish.sold / 850) * 100} className="h-1 bg-slate-50" indicatorClassName={dish.color} />
                        </div>
                    ))}
                </div>
                <Button variant="ghost" className="w-full mt-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary">
                    View Full Menu Analytics
                </Button>
            </div>

            {/* Performance Card */}
            <div className="bg-charcoal text-white rounded-[2.5rem] p-8 shadow-3d relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl rounded-full" />
                <h3 className="font-display text-xl font-bold mb-2 relative z-10">Owner Insight</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6 relative z-10">AI Smart Summary</p>
                
                <div className="space-y-4 relative z-10">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-xs font-medium text-white/80 leading-relaxed">
                            Revenue is up by <span className="text-sage font-bold">14.2%</span> this week. <br />
                            Peak traffic shifted earlier by 45 mins.
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Printable Closing Report */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-16 font-sans text-black">
        <div className="max-w-4xl mx-auto border-4 border-black p-12 relative overflow-hidden">
            {/* Watermark Decor */}
            <div className="absolute top-10 right-10 opacity-[0.05] grayscale">
                <Activity className="w-64 h-64" />
            </div>

            <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">DAILY CLOSING REPORT</h1>
                    <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">Flavor Haven • Executive Analytics</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">{new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
                    <p className="text-sm font-medium text-slate-400">Generated at {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-16">
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-200 pb-2">Financial Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2">
                            <span className="font-bold text-slate-500">Gross Revenue</span>
                            <span className="text-3xl font-black">₹{stats?.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2">
                            <span className="font-bold text-slate-500">Net Orders</span>
                            <span className="text-3xl font-black">{stats?.orderCount}</span>
                        </div>
                        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2">
                            <span className="font-bold text-slate-500">Average Ticket</span>
                            <span className="text-xl font-bold">₹{Math.round(stats?.totalRevenue / stats?.orderCount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-200 pb-2">Operational KPIs</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2">
                            <span className="font-bold text-slate-500">Avg. Preparation Time</span>
                            <span className="text-xl font-bold">{stats?.avgPrepTime}</span>
                        </div>
                        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2">
                            <span className="font-bold text-slate-500">Top Performing Category</span>
                            <span className="text-xl font-bold">Main Course</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-16">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-200 pb-4 mb-6">Top Product Performance</h3>
                <div className="space-y-4">
                    {topDishes.slice(0, 3).map((dish, idx) => (
                        <div key={idx} className="flex justify-between items-center text-lg">
                            <span className="font-bold">{idx + 1}. {dish.name}</span>
                            <div className="flex items-center gap-8">
                                <span className="font-medium text-slate-400">{dish.sold} sold</span>
                                <span className="font-black text-sage">{dish.growth} growth</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-20 pt-10 border-t-2 border-dashed border-slate-200 flex justify-between items-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">© 2026 Flavor Haven Private Limited • CONFIDENTIAL</p>
                <div className="w-20 h-20 bg-black rounded-lg" />
            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
