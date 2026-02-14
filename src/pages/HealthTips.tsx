import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Heart, Shield, Pill, AlertTriangle, Search, BookOpen,
  ScanLine, Thermometer, Clock, Eye, Package, Droplets
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HealthTip {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const TIPS: HealthTip[] = [
  {
    id: '1', title: 'How to Spot Fake Medicine', category: 'Safety',
    summary: 'Key signs that a medicine might be counterfeit',
    content: '• Check packaging for misspellings or blurry print\n• Verify the hologram or security seal\n• Compare color and size with previous purchases\n• Check if the medicine dissolves differently than usual\n• Look for unusual smell or taste\n• Always buy from licensed pharmacies',
    icon: Eye, color: 'text-destructive', bg: 'bg-destructive/10',
  },
  {
    id: '2', title: 'Medicine Storage Guidelines', category: 'Storage',
    summary: 'How to properly store your medicines at home',
    content: '• Store in a cool, dry place away from sunlight\n• Keep medicines in original packaging\n• Don\'t store in bathrooms (humidity)\n• Keep out of reach of children\n• Check temperature requirements on label\n• Never freeze medicines unless instructed',
    icon: Thermometer, color: 'text-primary', bg: 'bg-primary/10',
  },
  {
    id: '3', title: 'Understanding Expiry Dates', category: 'Safety',
    summary: 'What expiry dates really mean for your medicine',
    content: '• Expiry date = guaranteed potency until that date\n• Expired medicine may be less effective or harmful\n• Some medicines degrade into toxic compounds\n• Never use expired eye drops or injectables\n• Return expired medicines to your pharmacy\n• Don\'t flush medicines down the toilet',
    icon: Clock, color: 'text-warning', bg: 'bg-warning/10',
  },
  {
    id: '4', title: 'Drug Interaction Basics', category: 'Interactions',
    summary: 'Common drug interactions you should know about',
    content: '• Always tell your doctor about all medicines you take\n• Some foods interact with medicines (grapefruit, dairy)\n• Avoid alcohol with most medications\n• Herbal supplements can interact with prescriptions\n• Timing matters — some drugs shouldn\'t be taken together\n• Use one pharmacy to catch interaction risks',
    icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10',
  },
  {
    id: '5', title: 'Safe Online Pharmacy Guide', category: 'Purchasing',
    summary: 'How to safely buy medicine online',
    content: '• Only use licensed online pharmacies\n• Check for verification seals\n• Avoid sites that don\'t require prescriptions\n• Be wary of extremely low prices\n• Verify the pharmacy\'s physical address\n• Check for a licensed pharmacist contact',
    icon: Shield, color: 'text-success', bg: 'bg-success/10',
  },
  {
    id: '6', title: 'Reading Medicine Labels', category: 'Education',
    summary: 'Understanding the information on your medicine packaging',
    content: '• Active ingredient — the actual drug\n• Dosage — how much to take and when\n• Warnings — who should not take this medicine\n• Side effects — what to watch for\n• Storage — how to keep the medicine safe\n• Batch number — for tracking and verification',
    icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10',
  },
  {
    id: '7', title: 'When to Seek Emergency Help', category: 'Emergency',
    summary: 'Signs that you need immediate medical attention',
    content: '• Severe allergic reaction (swelling, difficulty breathing)\n• Overdose symptoms (drowsiness, fast heartbeat)\n• Unexpected severe side effects\n• Medicine appears different than usual\n• Child accidentally took medicine\n• Call emergency services immediately if in doubt',
    icon: Heart, color: 'text-destructive', bg: 'bg-destructive/10',
  },
  {
    id: '8', title: 'Proper Disposal of Medicines', category: 'Safety',
    summary: 'How to safely dispose of unused or expired medicine',
    content: '• Return to pharmacy take-back programs\n• Mix with coffee grounds or kitty litter before disposal\n• Remove personal information from labels\n• Never share prescription medicines\n• Check for special disposal instructions\n• Some pharmacies offer mail-back envelopes',
    icon: Droplets, color: 'text-primary', bg: 'bg-primary/10',
  },
];

export default function HealthTips() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const categories = [...new Set(TIPS.map(t => t.category))];
  const filtered = TIPS.filter(t =>
    (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.summary.toLowerCase().includes(search.toLowerCase())) &&
    (!category || t.category === category)
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-success/[0.03] to-background border-b border-border">
        <div className="container max-w-2xl py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <BookOpen className="h-5 w-5 text-success" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-foreground">Health & Safety Tips</h1>
              <p className="text-[13px] text-muted-foreground">Essential medicine safety knowledge</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <div className="flex flex-col gap-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tips..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11" />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCategory(null)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${!category ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              All
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c === category ? null : c)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${category === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Tips List */}
          <div className="flex flex-col gap-3">
            {filtered.map((tip, idx) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="apple-card overflow-hidden cursor-pointer"
                onClick={() => setExpandedId(expandedId === tip.id ? null : tip.id)}
              >
                <div className="p-5 flex items-center gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tip.bg}`}>
                    <tip.icon className={`h-5 w-5 ${tip.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[14px] font-semibold text-foreground">{tip.title}</h3>
                      <Badge variant="outline" className="text-[10px] rounded-full">{tip.category}</Badge>
                    </div>
                    <p className="text-[12px] text-muted-foreground">{tip.summary}</p>
                  </div>
                </div>
                {expandedId === tip.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 pb-5 border-t border-border/40 pt-4"
                  >
                    <div className="text-[13px] text-foreground/80 whitespace-pre-line leading-relaxed">{tip.content}</div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="apple-card p-6 text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-[15px] font-semibold text-foreground mb-1">Stay Protected</h3>
            <p className="text-[13px] text-muted-foreground mb-4">Scan your medicine to verify its authenticity</p>
            <Link to="/consumer">
              <Button className="rounded-xl gap-2"><ScanLine className="h-4 w-4" /> Verify Medicine</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
