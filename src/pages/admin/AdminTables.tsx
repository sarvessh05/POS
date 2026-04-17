import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  QrCode, 
  Users, 
  Trash2, 
  Download, 
  RefreshCcw,
  Search,
  Filter
} from 'lucide-react';
import { 
  useTables, 
  useAddTable, 
  useDeleteTable, 
  useCaptains, 
  useRegenerateQR 
} from '@/hooks/useDatabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

const AdminTables = () => {
  const { data: tables, isLoading } = useTables();
  const { data: captains } = useCaptains();
  const { mutateAsync: addTable } = useAddTable();
  const { mutateAsync: deleteTable } = useDeleteTable();
  const { mutateAsync: regenerateQR } = useRegenerateQR();

  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('4');
  const [newTableSection, setNewTableSection] = useState('Main Hall');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddTable = async () => {
    try {
      await addTable({
        number: parseInt(newTableNumber),
        seat_count: parseInt(newTableSeats),
        section: newTableSection,
        status: 'available'
      });
      setIsAddOpen(false);
      setNewTableNumber('');
      toast.success(`Table ${newTableNumber} added successfully`);
    } catch (e) {
      toast.error("Failed to add table. Number might already exist.");
    }
  };

  const handleRegenerate = async (tableId: string, number: number) => {
    try {
      await regenerateQR(tableId);
      toast.success(`QR Token refreshed for Table ${number}`);
    } catch (e) {
      toast.error("Failed to refresh token");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="font-display text-4xl font-black text-foreground tracking-tight italic-font">Table Management</h1>
          <p className="text-foreground/40 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Add tables and generate QR access tokens</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-foreground text-white font-bold gap-3 shadow-glow hover:scale-105 transition-all">
              <Plus className="w-5 h-5" />
              Add New Table
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] bg-white border-none shadow-premium p-10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Register Table</DialogTitle>
              <DialogDescription className="font-medium">Define the physical parameters of the new table</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Table Number</Label>
                  <Input 
                    type="number" 
                    value={newTableNumber} 
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="e.g. 15"
                    className="h-12 rounded-xl border-foreground/5 bg-slate-50 font-bold"
                  />
               </div>
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Seat Capacity</Label>
                  <Input 
                    type="number" 
                    value={newTableSeats} 
                    onChange={(e) => setNewTableSeats(e.target.value)}
                    placeholder="4"
                    className="h-12 rounded-xl border-foreground/5 bg-slate-50 font-bold"
                  />
               </div>
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Section</Label>
                  <Select value={newTableSection} onValueChange={setNewTableSection}>
                    <SelectTrigger className="h-12 rounded-xl border-foreground/5 bg-slate-50 font-bold">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-premium p-2">
                       <SelectItem value="Main Hall" className="rounded-xl font-bold">Main Hall</SelectItem>
                       <SelectItem value="Terrace" className="rounded-xl font-bold">Terrace</SelectItem>
                       <SelectItem value="VIP Lounge" className="rounded-xl font-bold">VIP Lounge</SelectItem>
                       <SelectItem value="Garden" className="rounded-xl font-bold">Garden Case</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <Button onClick={handleAddTable} className="w-full h-14 rounded-2xl font-bold bg-primary text-white shadow-glow mt-2">
                 Create Table & Token
               </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tables?.map((table) => (
          <Card key={table.id} className="rounded-[2.5rem] border-foreground/5 shadow-soft overflow-hidden bg-white group hover:shadow-premium transition-all duration-500">
            <CardContent className="p-0">
               {/* QR Presentation */}
               <div className="aspect-square bg-slate-50 flex items-center justify-center p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10 p-6 bg-white rounded-3xl shadow-soft border border-foreground/5 group-hover:scale-105 transition-transform duration-500">
                    {/* Mock QR Representation */}
                    <div className="w-40 h-40 grid grid-cols-8 gap-1 p-2 opacity-80 decoration-primary border-4 border-foreground/10">
                       {[...Array(64)].map((_, i) => (
                          <div key={i} className={`rounded-sm ${Math.random() > 0.65 ? 'bg-foreground' : 'bg-transparent'}`} />
                       ))}
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleRegenerate(table.id, table.number)}
                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-soft hover:bg-white text-foreground/40 hover:text-primary transition-all"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </Button>
                  </div>
               </div>

               <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-3xl font-black text-foreground">Table {table.number}</h3>
                        <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest mt-1">{table.section} • {table.seat_count} Seats</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="w-12 h-12 rounded-2xl border-foreground/5 bg-slate-50 hover:bg-primary/10 hover:text-primary transition-all">
                           <Download className="w-5 h-5" />
                        </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-foreground/5 group/info">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-soft group-hover/info:scale-110 transition-transform">
                           <Users className="w-4 h-4 text-foreground/40" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Assigned Captain</p>
                           <p className="text-sm font-bold text-foreground">{table.captains?.name || 'Unassigned'}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          className="flex-1 h-12 rounded-xl text-foreground/40 hover:text-destructive hover:bg-destructive/5 font-bold gap-2"
                          onClick={() => {
                            if(confirm(`Delete Table ${table.number}? This will invalidate its QR code.`)) {
                                deleteTable(table.id);
                            }
                          }}
                        >
                           <Trash2 className="w-4 h-4" />
                           Remove Table
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 h-12 rounded-xl border-foreground/5 bg-foreground text-white font-bold gap-2 shadow-soft"
                          onClick={() => {
                            const url = `${window.location.origin}/dine/${table.qr_token}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Guest URL copied to clipboard");
                          }}
                        >
                           <QrCode className="w-4 h-4" />
                           Copy URL
                        </Button>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center gap-4 opacity-20">
           <RefreshCcw className="w-10 h-10 animate-spin" />
           <p className="font-black uppercase tracking-widest text-[10px]">Synchronizing Vault...</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTables;
