import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Flag, Loader2, CheckCircle, Camera, X, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportIssue() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [batchId, setBatchId] = useState(searchParams.get('batch') || '');
  const [reportType, setReportType] = useState('suspicious');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const b = searchParams.get('batch');
    if (b) setBatchId(b);
  }, [searchParams]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim()) return;
    setLoading(true);

    try {
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const filePath = `reports/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('medicine-images')
          .upload(filePath, imageFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('medicine-images').getPublicUrl(filePath);
          photoUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from('consumer_reports').insert({
        batch_id: batchId.trim(),
        reporter_id: user?.id || null,
        report_type: reportType,
        description: description || null,
        photo_url: photoUrl,
      });
      if (error) throw error;

      // Auto-create alert for regulators
      await supabase.from('alerts').insert({
        batch_id: batchId.trim(),
        alert_type: 'consumer_report',
        severity: reportType === 'counterfeit' ? 'high' : 'medium',
        message: `Consumer report: ${reportType} — ${description || 'No details'}`,
        risk_score: reportType === 'counterfeit' ? 70 : 40,
      });

      setSubmitted(true);
      toast.success('Report submitted. Thank you for helping keep medicines safe.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="container max-w-lg py-16 animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="apple-card p-10 flex flex-col items-center gap-4 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-[22px] font-bold text-foreground">Report Submitted</h1>
          <p className="text-[14px] text-muted-foreground max-w-sm">
            Thank you for protecting others. Our safety team will investigate and take necessary action to keep medicines safe.
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => { setSubmitted(false); setBatchId(''); setDescription(''); removeImage(); }} className="rounded-xl">
              Submit Another Report
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-warning/[0.03] to-background border-b border-border">
        <div className="container max-w-lg py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10">
              <Shield className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-foreground">Report Suspicious Medicine</h1>
              <p className="text-[13px] text-muted-foreground">Help protect others by reporting unsafe products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-lg py-8">
        <div className="apple-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Batch ID */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="batchId" className="text-[13px] font-medium text-foreground">Batch Code *</Label>
              <Input id="batchId" placeholder="e.g. BATCH-2026-001" value={batchId} onChange={(e) => setBatchId(e.target.value)} required className="h-11 rounded-xl text-[14px]" />
              <p className="text-[11px] text-muted-foreground">Found on your medicine packaging or QR scan result</p>
            </div>

            {/* Report Type */}
            <div className="flex flex-col gap-2">
              <Label className="text-[13px] font-medium text-foreground">What's wrong?</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-11 rounded-xl text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suspicious">🔍 Suspicious Packaging</SelectItem>
                  <SelectItem value="counterfeit">🚨 Suspected Fake Medicine</SelectItem>
                  <SelectItem value="expired">⏰ Expired Medicine Being Sold</SelectItem>
                  <SelectItem value="side_effects">💊 Unexpected Side Effects</SelectItem>
                  <SelectItem value="other">📝 Other Concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col gap-2">
              <Label className="text-[13px] font-medium text-foreground">Photo Evidence (Optional)</Label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={imagePreview} alt="Report evidence" className="w-full h-48 object-cover" />
                  <Button
                    type="button" variant="destructive" size="icon"
                    onClick={removeImage}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/30 hover:bg-primary/[0.02] transition-colors cursor-pointer">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[13px] text-muted-foreground font-medium">Tap to upload photo</span>
                  <span className="text-[11px] text-muted-foreground/60">JPG, PNG up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="desc" className="text-[13px] font-medium text-foreground">Tell us more (Optional)</Label>
              <Textarea
                id="desc"
                placeholder="Describe what seems wrong — where you bought it, what looks different, any symptoms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl text-[14px] min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-[14px] font-semibold mt-1 gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Flag className="h-4 w-4" /> Submit Safety Report</>}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Your report is confidential and helps protect other consumers.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
