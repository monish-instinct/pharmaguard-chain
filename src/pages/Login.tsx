import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Lock, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [verifyEmail, setVerifyEmail] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Create auth user (email confirmation not required for demo)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { display_name: displayName },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create user profile
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            display_name: displayName,
          });
          
          if (profileError && profileError.code !== '23505') {
            // Ignore duplicate key errors
            throw profileError;
          }

          // Assign role
          const { error: roleError } = await supabase.from('user_roles').insert({
            user_id: data.user.id,
            role,
          });
          
          if (roleError && roleError.code !== '23505') {
            throw roleError;
          }

          setVerifyEmail(email);
          setShowVerification(true);
          toast.success('Account created successfully!');
          
          // Auto-sign in after brief delay
          setTimeout(() => {
            setIsSignUp(false);
            setPassword('');
          }, 2500);
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
          toast.success('Signed in successfully!');
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('[v0] Auth error:', err);
      if (err.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in.');
      } else {
        toast.error(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl shadow-lg-ios border border-white/20 overflow-hidden">
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-md-ios">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              {showVerification ? 'Verify Email' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-base">
              {showVerification
                ? 'Check your email for verification link'
                : isSignUp
                ? 'Join PharmaShield to secure pharmaceutical supply chains'
                : 'Sign in to your PharmaShield account'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            {showVerification ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Account Created Successfully!</p>
                    <p className="text-foreground/70 mt-1">
                      Your account has been created. You can now sign in and start using PharmaShield.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-start gap-2">
                  <Mail className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/60">
                    A verification email has been sent to <span className="font-semibold">{verifyEmail}</span>
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setShowVerification(false);
                    setIsSignUp(false);
                    setPassword('');
                  }}
                  className="w-full rounded-xl py-2.5 font-semibold shadow-md-ios hover:shadow-lg-ios transition-all"
                >
                  Continue to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Display Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Pharma"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="rounded-xl h-11"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl h-11"
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Your Role
                    </Label>
                    <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy / Distributor</SelectItem>
                        <SelectItem value="regulator">Regulator / Authority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-2.5 font-semibold h-11 shadow-md-ios hover:shadow-lg-ios transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-background border-t-white animate-spin"></div>
                      {isSignUp ? 'Creating Account...' : 'Signing in...'}
                    </div>
                  ) : isSignUp ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-primary hover:text-primary/80"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setPassword('');
                  }}
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
              </form>
            )}
          </CardContent>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-foreground/50 mt-6">
          By signing in, you agree to PharmaShield's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
