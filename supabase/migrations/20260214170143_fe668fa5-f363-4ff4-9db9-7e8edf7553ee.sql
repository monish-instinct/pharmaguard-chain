
-- Fix 1: Remove overly permissive trust_scores UPDATE and INSERT policies
DROP POLICY IF EXISTS "System can update trust scores" ON public.trust_scores;
DROP POLICY IF EXISTS "System can insert trust scores" ON public.trust_scores;

-- Trust scores should only be managed via service role (edge functions).
-- No user-facing INSERT/UPDATE policies needed.

-- Fix 2: Make medicine-images bucket private and restrict access
UPDATE storage.buckets SET public = false WHERE id = 'medicine-images';

-- Drop existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view medicine images" ON storage.objects;

-- Authenticated users can view medicine images
CREATE POLICY "Authenticated users can view medicine images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medicine-images' AND auth.uid() IS NOT NULL);

-- Fix 3: Create auth_nonces table for wallet auth replay protection
CREATE TABLE public.auth_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce text NOT NULL UNIQUE,
  used_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_nonces ENABLE ROW LEVEL SECURITY;

-- No user-facing policies needed - only service role accesses this table

-- Auto-cleanup: delete nonces older than 10 minutes
CREATE OR REPLACE FUNCTION public.cleanup_expired_nonces()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.auth_nonces WHERE used_at < now() - interval '10 minutes';
$$;
