import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AppRole } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AppRole>('manufacturer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from('user_roles').insert({ user_id: data.user.id, role });

          if (data.session) {
            toast.success('Account created! You are now signed in.');
            navigate('/');
            return;
          }

          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError) {
            toast.success('Account created! You are now signed in.');
            navigate('/');
          } else {
            toast.success('Account created! Please sign in below.');
            setIsSignUp(false);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Signed in successfully');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-sm animate-scale-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary glow-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {isSignUp ? 'Register for PharmaShield' : 'Sign in to PharmaShield'}
          </p>
        </div>

        {/* Form Card */}
        <div className="apple-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-[13px] font-medium text-foreground">Display Name</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-primary/20"
                  placeholder="Your name"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-[13px] font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-primary/20"
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-[13px] font-medium text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 rounded-xl bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-primary/20"
                placeholder="Min. 6 characters"
              />
            </div>
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label className="text-[13px] font-medium text-foreground">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                  <SelectTrigger className="h-11 rounded-xl bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[14px] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy / Distributor</SelectItem>
                    <SelectItem value="regulator">Regulator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-[14px] font-medium mt-1 glow-primary"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Toggle */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[13px] text-primary font-medium hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </main>
  );
}
