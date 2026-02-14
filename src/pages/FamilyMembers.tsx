import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Users, Plus, Trash2, Pill, Heart, Shield, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  date_of_birth: string | null;
  notes: string | null;
  avatar_emoji: string;
  created_at: string;
}

const EMOJIS = ['👤', '👩', '👨', '👶', '👧', '👦', '👵', '👴', '🧒', '🐱', '🐶'];
const RELATIONSHIPS = ['spouse', 'child', 'parent', 'sibling', 'grandparent', 'friend', 'other'];

export default function FamilyMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', relationship: 'child', date_of_birth: '', notes: '', avatar_emoji: '👤' });
  const [adding, setAdding] = useState(false);
  const [medCounts, setMedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('family_members').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('medicine_cabinet').select('family_member_id').eq('user_id', user.id).not('family_member_id', 'is', null),
    ]).then(([{ data: fam }, { data: meds }]) => {
      setMembers((fam as FamilyMember[]) || []);
      const counts: Record<string, number> = {};
      (meds || []).forEach((m: any) => { counts[m.family_member_id] = (counts[m.family_member_id] || 0) + 1; });
      setMedCounts(counts);
      setLoading(false);
    });
  }, [user]);

  const handleAdd = async () => {
    if (!newMember.name.trim() || !user) return;
    setAdding(true);
    const { error } = await supabase.from('family_members').insert({
      user_id: user.id,
      name: newMember.name.trim(),
      relationship: newMember.relationship,
      date_of_birth: newMember.date_of_birth || null,
      notes: newMember.notes || null,
      avatar_emoji: newMember.avatar_emoji,
    });
    if (error) { toast.error(error.message); }
    else {
      toast.success('Family member added');
      setAddOpen(false);
      setNewMember({ name: '', relationship: 'child', date_of_birth: '', notes: '', avatar_emoji: '👤' });
      const { data } = await supabase.from('family_members').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
      setMembers((data as FamilyMember[]) || []);
    }
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    await supabase.from('family_members').delete().eq('id', id);
    setMembers(members.filter(m => m.id !== id));
    toast.success('Family member removed');
  };

  if (!user) {
    return (
      <main className="container max-w-lg py-16 text-center animate-fade-in">
        <div className="apple-card p-10 flex flex-col items-center gap-4">
          <Users className="h-12 w-12 text-primary" />
          <h1 className="text-[20px] font-bold text-foreground">Sign In Required</h1>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Heart className="h-5 w-5 text-success" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Family Safety</h1>
                <p className="text-[13px] text-muted-foreground">Track medicines for your loved ones</p>
              </div>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Add Family Member</DialogTitle></DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  <div>
                    <Label className="text-[13px]">Avatar</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {EMOJIS.map(e => (
                        <button key={e} type="button" onClick={() => setNewMember({...newMember, avatar_emoji: e})}
                          className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                            newMember.avatar_emoji === e ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'bg-muted hover:bg-muted/80'
                          }`}>{e}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[13px]">Name *</Label>
                    <Input placeholder="e.g. Sarah" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-[13px]">Relationship</Label>
                    <Select value={newMember.relationship} onValueChange={v => setNewMember({...newMember, relationship: v})}>
                      <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIPS.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[13px]">Date of Birth</Label>
                    <Input type="date" value={newMember.date_of_birth} onChange={e => setNewMember({...newMember, date_of_birth: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  <Button onClick={handleAdd} disabled={adding} className="rounded-xl">{adding ? 'Adding...' : 'Add Member'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : members.length === 0 ? (
            <div className="apple-card p-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[14px] text-muted-foreground mb-1">No family members yet</p>
              <p className="text-[12px] text-muted-foreground mb-4">Add family members to track their medicines separately</p>
              <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setAddOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Add Family Member
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="flex flex-col gap-3">
                {members.map(member => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="apple-card p-5 flex items-center gap-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.06] text-2xl">
                      {member.avatar_emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-foreground">{member.name}</h3>
                      <p className="text-[12px] text-muted-foreground capitalize">{member.relationship}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Pill className="h-3 w-3" /> {medCounts[member.id] || 0} medicines
                        </span>
                        {member.date_of_birth && (
                          <span className="text-[11px] text-muted-foreground">
                            Born {new Date(member.date_of_birth).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive" onClick={() => handleRemove(member.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Link to Cabinet */}
          <Link to="/cabinet">
            <div className="apple-card-interactive p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.06] text-primary">
                <Pill className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-semibold text-foreground">Medicine Cabinet</h4>
                <p className="text-[11px] text-muted-foreground">Assign medicines to family members</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
