import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, Search, Mail, Phone, MoreVertical, 
    ShieldCheck, User, Star, Clock, Trash 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StaffMember {
  id: string;
  name: string;
  role: 'Captain' | 'Waiter' | 'Chef' | 'Admin';
  email: string;
  phone: string;
  status: 'active' | 'on-break' | 'offline';
  rating: number;
  ordersHandled: number;
  joinedDate: string;
  image?: string;
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'Captain',
    email: 'rahul.s@flavorhaven.com',
    phone: '+91 98765 43210',
    status: 'active',
    rating: 4.8,
    ordersHandled: 1240,
    joinedDate: 'Jan 2023',
    image: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Waiter',
    email: 'priya.p@flavorhaven.com',
    phone: '+91 98765 43211',
    status: 'active',
    rating: 4.9,
    ordersHandled: 850,
    joinedDate: 'Mar 2023',
    image: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: '3',
    name: 'Vikram Singh',
    role: 'Chef',
    email: 'vikram.chef@flavorhaven.com',
    phone: '+91 98765 43212',
    status: 'on-break',
    rating: 4.7,
    ordersHandled: 3200,
    joinedDate: 'Jun 2022',
    image: 'https://i.pravatar.cc/150?u=3'
  },
  {
      id: '4',
      name: 'Ananya Iyer',
      role: 'Captain',
      email: 'ananya.i@flavorhaven.com',
      phone: '+91 98765 43213',
      status: 'offline',
      rating: 4.6,
      ordersHandled: 920,
      joinedDate: 'Aug 2023',
      image: 'https://i.pravatar.cc/150?u=4'
  }
];

const RoleBadge = ({ role }: { role: string }) => {
    const colors: any = {
        'Captain': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'Waiter': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        'Chef': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        'Admin': 'bg-primary/10 text-primary border-primary/20'
    };
    return (
        <Badge className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest border ${colors[role] || ''}`}>
            {role}
        </Badge>
    );
};

const StatusPill = ({ status }: { status: string }) => {
    const configs: any = {
        'active': { color: 'bg-sage', label: 'Online' },
        'on-break': { color: 'bg-gold', label: 'Breathing' },
        'offline': { color: 'bg-slate-300', label: 'Clocked Out' }
    };
    const config = configs[status] || configs['offline'];
    return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
            <div className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{config.label}</span>
        </div>
    );
};

const AdminStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = staff.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-display text-4xl font-black text-foreground tracking-tight">Team Roster</h1>
            <p className="text-foreground/40 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Manage your hospitality warriors</p>
          </div>
          <Button className="rounded-2xl h-14 px-8 gap-2 shadow-glow text-base font-bold">
            <Plus className="w-5 h-5" />
            <span>Recruit New Staff</span>
          </Button>
        </div>

        <div className="relative max-w-2xl mb-12 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by name, role or ID..." 
            className="pl-14 h-16 rounded-3xl border-foreground/5 bg-white shadow-soft text-lg focus:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-foreground/5 hover:shadow-premium transition-all duration-500 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                 <button className="p-2 rounded-xl hover:bg-slate-50 text-foreground/20 hover:text-foreground transition-all">
                    <MoreVertical className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex items-center gap-6 mb-8">
                 <Avatar className="h-20 w-20 rounded-[2rem] shadow-premium">
                    <AvatarImage src={member.image} />
                    <AvatarFallback>{member.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                 </Avatar>
                 <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <RoleBadge role={member.role} />
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3 text-sm text-foreground/50 font-medium">
                    <Mail className="w-4 h-4 text-primary/40" />
                    <span>{member.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-foreground/50 font-medium">
                    <Phone className="w-4 h-4 text-primary/40" />
                    <span>{member.phone}</span>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-foreground/5">
                 <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gold mb-1">
                       <Star className="w-3 h-3 fill-current" />
                       <span className="text-sm font-black text-foreground">{member.rating}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Rating</span>
                 </div>
                 <div className="text-center border-x border-foreground/5">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                       <ShieldCheck className="w-3 h-3" />
                       <span className="text-sm font-black text-foreground">{member.ordersHandled}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Orders</span>
                 </div>
                 <div className="text-center flex flex-col items-center justify-center">
                    <div className="mb-1">
                       <StatusPill status={member.status} />
                    </div>
                 </div>
              </div>
              
              <div className="mt-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <Button variant="outline" className="flex-1 rounded-2xl border-foreground/5 font-bold h-12">View Profile</Button>
                 <Button variant="outline" className="rounded-2xl border-destructive/10 text-destructive hover:bg-destructive/5 h-12">
                    <Trash className="w-4 h-4" />
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStaff;
