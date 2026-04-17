import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RefreshCcw, Shield, Globe, BellRing } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [gstRate, setGstRate] = useState('5.0');
  const [serviceCharge, setServiceCharge] = useState('0.0');
  const [showServiceCharge, setShowServiceCharge] = useState(false);

  const handleSave = () => {
    toast.success("Settings updated successfully", {
        description: "Your changes have been synced with the production database."
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
            <h1 className="font-display text-4xl font-black text-foreground tracking-tight">System Control</h1>
            <p className="text-foreground/40 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Configure global restaurant parameters</p>
        </div>

        <div className="grid gap-8">
            {/* Tax Configuration */}
            <Card className="rounded-[2.5rem] border-foreground/5 shadow-soft overflow-hidden">
                <CardHeader className="p-8 bg-slate-50/50 border-b border-foreground/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Tax & Charges</CardTitle>
                            <CardDescription className="font-medium">Manage GST and service fee structures</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-foreground/40">GST Rate (%)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-foreground/20">%</span>
                                <Input 
                                    type="number" 
                                    value={gstRate} 
                                    onChange={(e) => setGstRate(e.target.value)}
                                    className="pl-10 h-14 rounded-2xl border-foreground/5 bg-slate-50 font-bold text-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-foreground/40">Service Charge (%)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-foreground/20">%</span>
                                <Input 
                                    type="number" 
                                    value={serviceCharge} 
                                    onChange={(e) => setServiceCharge(e.target.value)}
                                    className="pl-10 h-14 rounded-2xl border-foreground/5 bg-slate-50 font-bold text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-foreground/5">
                        <div className="space-y-1">
                            <p className="font-bold text-foreground">Visibility on Bill</p>
                            <p className="text-sm text-foreground/40 font-medium">Show service charge explicitly in the breakdown accordion</p>
                        </div>
                        <Switch 
                            checked={showServiceCharge} 
                            onCheckedChange={setShowServiceCharge}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* General Settings */}
            <Card className="rounded-[2.5rem] border-foreground/5 shadow-soft overflow-hidden">
                <CardHeader className="p-8 bg-slate-50/50 border-b border-foreground/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-sage" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">General Preferences</CardTitle>
                            <CardDescription className="font-medium">Restaurant identity and regional settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-foreground/40">Display Name</Label>
                        <Input 
                            defaultValue="Flavor Haven Elite" 
                            className="h-14 rounded-2xl border-foreground/5 bg-slate-50 font-bold text-lg"
                        />
                    </div>
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-foreground/5">
                        <div className="flex items-center gap-4">
                            <BellRing className="w-5 h-5 text-primary" />
                            <div>
                                <p className="font-bold text-foreground">Order Notifications</p>
                                <p className="text-sm text-foreground/40 font-medium">Sound chime on new incoming orders</p>
                            </div>
                        </div>
                        <Switch checked />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4 mt-4">
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-foreground/5 font-bold gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Reset to Default
                </Button>
                <Button onClick={handleSave} className="h-14 px-12 rounded-2xl font-bold shadow-glow gap-2 bg-foreground text-white">
                    <Save className="w-5 h-5" />
                    Save Configuration
                </Button>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
