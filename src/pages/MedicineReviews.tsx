import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Star, Plus, Search, MessageSquare, ThumbsUp, Pill, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  user_id: string;
  batch_id: string;
  medicine_name: string | null;
  rating: number;
  title: string | null;
  review_text: string | null;
  helpful_count: number;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

function StarRating({ rating, onRate, size = 'md' }: { rating: number; onRate?: (r: number) => void; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onRate?.(i)} className={onRate ? 'cursor-pointer' : 'cursor-default'}>
          <Star className={`${sz} ${i <= rating ? 'text-warning fill-warning' : 'text-muted-foreground/20'}`} />
        </button>
      ))}
    </div>
  );
}

export default function MedicineReviews() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newReview, setNewReview] = useState({ batch_id: searchParams.get('batch') || '', medicine_name: '', rating: 5, title: '', review_text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('medicine_reviews').select('*').order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setReviews((data as Review[]) || []); setLoading(false); });
  }, []);

  const handleSubmit = async () => {
    if (!newReview.batch_id.trim() || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from('medicine_reviews').insert({
      user_id: user.id,
      batch_id: newReview.batch_id.trim(),
      medicine_name: newReview.medicine_name || null,
      rating: newReview.rating,
      title: newReview.title || null,
      review_text: newReview.review_text || null,
    });
    if (error) {
      toast.error(error.code === '23505' ? 'You already reviewed this medicine' : error.message);
    } else {
      toast.success('Review submitted!');
      setAddOpen(false);
      setNewReview({ batch_id: '', medicine_name: '', rating: 5, title: '', review_text: '' });
      const { data } = await supabase.from('medicine_reviews').select('*').order('created_at', { ascending: false }).limit(50);
      setReviews((data as Review[]) || []);
    }
    setSubmitting(false);
  };

  const filtered = reviews.filter(r =>
    !search || r.medicine_name?.toLowerCase().includes(search.toLowerCase()) || r.batch_id.toLowerCase().includes(search.toLowerCase())
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/[0.03] to-background border-b border-border">
        <div className="container max-w-2xl py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Medicine Reviews</h1>
                <p className="text-[13px] text-muted-foreground">Share & read community experiences</p>
              </div>
            </div>
            {user && (
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl gap-1.5"><Plus className="h-4 w-4" /> Review</Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader><DialogTitle>Write a Review</DialogTitle></DialogHeader>
                  <div className="flex flex-col gap-4 mt-2">
                    <div>
                      <Label className="text-[13px]">Batch Code *</Label>
                      <Input placeholder="BATCH-2026-001" value={newReview.batch_id} onChange={e => setNewReview({...newReview, batch_id: e.target.value})} className="mt-1 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-[13px]">Medicine Name</Label>
                      <Input placeholder="e.g. Amoxicillin" value={newReview.medicine_name} onChange={e => setNewReview({...newReview, medicine_name: e.target.value})} className="mt-1 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-[13px]">Rating</Label>
                      <div className="mt-2">
                        <StarRating rating={newReview.rating} onRate={r => setNewReview({...newReview, rating: r})} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[13px]">Title</Label>
                      <Input placeholder="Summary of your experience" value={newReview.title} onChange={e => setNewReview({...newReview, title: e.target.value})} className="mt-1 rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-[13px]">Your Review</Label>
                      <Textarea placeholder="Share your experience with this medicine..." value={newReview.review_text} onChange={e => setNewReview({...newReview, review_text: e.target.value})} className="mt-1 rounded-xl min-h-[80px]" />
                    </div>
                    <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl">{submitting ? 'Submitting...' : 'Submit Review'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <div className="flex flex-col gap-5">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="apple-card p-4 text-center">
              <p className="text-[24px] font-bold text-foreground">{reviews.length}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Reviews</p>
            </div>
            <div className="apple-card p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-warning fill-warning" />
                <p className="text-[24px] font-bold text-foreground">{avgRating}</p>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Avg Rating</p>
            </div>
            <div className="apple-card p-4 text-center">
              <p className="text-[24px] font-bold text-success">{reviews.filter(r => r.rating >= 4).length}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Positive</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11" />
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="apple-card p-12 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[14px] text-muted-foreground">No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="apple-card p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-[11px] text-muted-foreground">{timeAgo(review.created_at)}</span>
                      </div>
                      {review.title && <h4 className="text-[14px] font-semibold text-foreground">{review.title}</h4>}
                    </div>
                    <Badge variant="outline" className="text-[10px] rounded-full shrink-0">{review.batch_id}</Badge>
                  </div>
                  {review.medicine_name && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Pill className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[12px] text-muted-foreground">{review.medicine_name}</span>
                    </div>
                  )}
                  {review.review_text && (
                    <p className="text-[13px] text-foreground/80 leading-relaxed">{review.review_text}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground rounded-lg gap-1">
                      <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpful_count})
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
