import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Pill, Plus, Trash2, Calendar, AlertTriangle, Clock,
  Shield, Search, Users, ScanLine, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CabinetItem {
  id: string;
  batch_id: string;
  medicine_name: string | null;
  manufacturer_name: string | null;
  expiry_date: string | null;
  dosage: string | null;
  notes: string | null;
  family_member_id: string | null;
  added_at: string;
}

interface FamilyMember {
  id: string;
  name: string;
  avatar_emoji: string;
}

function expiryStatus(date: string | null): { label: string; color: string; urgent: boolean } {
  if (!date) return { label: 'No expiry', color: 'text-muted-foreground', urgent: false };
  const diff = new Date(date).getTime() - Date.now();
  if (diff < 0) return { label: 'Expired', color: 'text-destructive', urgent: true };
  const days = Math.floor(diff / 86400000);
  if (days <= 30) return { label: `${days}d left`, color: 'text-destructive', urgent: true };
  if (days <= 90) return { label: `${Math.floor(days / 7)}w left`, color: 'text-warning', urgent: true };
  return { label: `${Math.floor(days / 30)}mo left`, color: 'text-success', urgent: false };
}

export default function MedicineCabinet() {
  const { user } = useAuth();
  const [items, setItems] = useState<CabinetItem[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ batch_id: '', medicine_name: '', manufacturer_name: '', expiry_date: '', dosage: '', notes: '', family_member_id: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('medicine_cabinet').select('*').eq('user_id', user.id).order('added_at', { ascending: false }),
      supabase.from('family_members').select('id, name, avatar_emoji').eq('user_id', user.id),
    ]).then(([{ data: cab }, { data: fam }]) => {
      setItems((cab as CabinetItem[]) || []);
      setFamilyMembers((fam as FamilyMember[]) || []);
      setLoading(false);
    });
  }, [user]);

  const handleAdd = async () => {
    if (!newItem.batch_id.trim() || !user) return;
    setAdding(true);
    const { error } = await supabase.from('medicine_cabinet').insert({
      user_id: user.id,
      batch_id: newItem.batch_id.trim(),
      medicine_name: newItem.medicine_name || null,
      manufacturer_name: newItem.manufacturer_name || null,
      expiry_date: newItem.expiry_date || null,
      dosage: newItem.dosage || null,
      notes: newItem.notes || null,
      family_member_id: newItem.family_member_id || null,
    });
    if (error) {
      toast.error(error.code === '23505' ? 'This medicine is already in your cabinet' : error.message);
    } else {
      toast.success('Medicine added to your cabinet');
      setAddOpen(false);
      setNewItem({ batch_id: '', medicine_name: '', manufacturer_name: '', expiry_date: '', dosage: '', notes: '', family_member_id: '' });
      const { data } = await supabase.from('medicine_cabinet').select('*').eq('user_id', user.id).order('added_at', { ascending: false });
      setItems((data as CabinetItem[]) || []);
    }
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    await supabase.from('medicine_cabinet').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
    toast.success('Removed from cabinet');
  };

  const filtered = items.filter(i =>
    !search || (i.medicine_name?.toLowerCase().includes(search.toLowerCase()) || i.batch_id.toLowerCase().includes(search.toLowerCase()))
  );

  const expiringItems = items.filter(i => i.expiry_date && expiryStatus(i.expiry_date).urgent);

  if (!user) {
    return (
      <main className="container max-w-lg py-16 text-center animate-fade-in">
        <div className="apple-card p-10 flex flex-col items-center gap-4">
          <Pill className="h-12 w-12 text-primary" />
          <h1 className="text-[20px] font-bold text-foreground">Sign In Required</h1>
          <p className="text-[14px] text-muted-foreground">Connect your wallet to manage your medicine cabinet.</p>
          <Link to="/login"><Button className="rounded-xl mt-2">Connect Wallet</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/[0.03] to-background border-b border-border">
        <div className="container max-w-2xl py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.07]">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Medicine Cabinet</h1>
                <p className="text-[13px] text-muted-foreground">Track your medicines & expiry dates</p>
              </div>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Add Medicine</DialogTitle></DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  <div>
                    <Label className="text-[13px]">Batch Code *</Label>
                    <Input placeholder="e.g. BATCH-2026-001" value={newItem.batch_id} onChange={e => setNewItem({...newItem, batch_id: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-[13px]">Medicine Name</Label>
                    <Input placeholder="e.g. Amoxicillin 500mg" value={newItem.medicine_name} onChange={e => setNewItem({...newItem, medicine_name: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[13px]">Manufacturer</Label>
                      <Input placeholder="Manufacturer" value={newItem.manufacturer_name} onChange={e => setNewItem({...newItem, manufacturer_name: e.target.value})} className="mt-1 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-[13px]">Dosage</Label>
                      <Input placeholder="e.g. 500mg" value={newItem.dosage} onChange={e => setNewItem({...newItem, dosage: e.target.value})} className="mt-1 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[13px]">Expiry Date</Label>
                    <Input type="date" value={newItem.expiry_date} onChange={e => setNewItem({...newItem, expiry_date: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  {familyMembers.length > 0 && (
                    <div>
                      <Label className="text-[13px]">For Family Member</Label>
                      <Select value={newItem.family_member_id} onValueChange={v => setNewItem({...newItem, family_member_id: v})}>
                        <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Myself" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Myself</SelectItem>
                          {familyMembers.map(f => <SelectItem key={f.id} value={f.id}>{f.avatar_emoji} {f.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-[13px]">Notes</Label>
                    <Textarea placeholder="Any notes..." value={newItem.notes} onChange={e => setNewItem({...newItem, notes: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  <Button onClick={handleAdd} disabled={adding} className="rounded-xl">{adding ? 'Adding...' : 'Add to Cabinet'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <div className="flex flex-col gap-5">
          {/* Expiry Alerts */}
          {expiringItems.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="apple-card border-warning/20 border p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="text-[14px] font-semibold text-foreground">Expiry Alerts</h3>
                <Badge variant="outline" className="text-[10px] rounded-full text-warning border-warning/20">{expiringItems.length}</Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                {expiringItems.slice(0, 3).map(i => {
                  const exp = expiryStatus(i.expiry_date);
                  return (
                    <div key={i.id} className="flex items-center gap-2 text-[13px]">
                      <Clock className={`h-3.5 w-3.5 ${exp.color}`} />
                      <span className="text-foreground font-medium">{i.medicine_name || i.batch_id}</span>
                      <span className={`ml-auto ${exp.color} font-semibold`}>{exp.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11" />
          </div>

          {/* Medicine List */}
          {loading ? (
            <div className="flex flex-col gap-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="apple-card p-12 text-center">
              <Pill className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[14px] text-muted-foreground mb-3">{search ? 'No medicines match your search' : 'Your cabinet is empty'}</p>
              {!search && (
                <div className="flex gap-2 justify-center">
                  <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5" /> Add Medicine</Button>
                  <Link to="/consumer"><Button size="sm" variant="outline" className="rounded-xl gap-1.5"><ScanLine className="h-3.5 w-3.5" /> Scan to Add</Button></Link>
                </div>
              )}
            </div>
          ) : (
            <AnimatePresence>
              <div className="flex flex-col gap-2">
                {filtered.map(item => {
                  const exp = expiryStatus(item.expiry_date);
                  const member = familyMembers.find(f => f.id === item.family_member_id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="apple-card p-4 flex items-center gap-3"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${exp.urgent ? 'bg-warning/10' : 'bg-primary/[0.06]'}`}>
                        <Pill className={`h-5 w-5 ${exp.urgent ? 'text-warning' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-semibold text-foreground truncate">{item.medicine_name || item.batch_id}</p>
                          {member && <Badge variant="secondary" className="text-[10px] rounded-full">{member.avatar_emoji} {member.name}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {item.dosage && <span className="text-[11px] text-muted-foreground">{item.dosage}</span>}
                          {item.manufacturer_name && <span className="text-[11px] text-muted-foreground">· {item.manufacturer_name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.expiry_date && (
                          <Badge variant="outline" className={`text-[10px] rounded-full ${exp.color} border-current/20`}>
                            {exp.label}
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive" onClick={() => handleRemove(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/consumer">
              <div className="apple-card-interactive p-4 flex items-center gap-3 h-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.06] text-primary">
                  <ScanLine className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-foreground">Scan & Add</h4>
                  <p className="text-[11px] text-muted-foreground">Verify then save</p>
                </div>
              </div>
            </Link>
            <Link to="/family">
              <div className="apple-card-interactive p-4 flex items-center gap-3 h-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/[0.06] text-success">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-foreground">Family</h4>
                  <p className="text-[11px] text-muted-foreground">Manage members</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
