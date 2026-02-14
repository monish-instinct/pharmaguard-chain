
-- ═══ Medicine Cabinet: consumers save medicines they use ═══
CREATE TABLE public.medicine_cabinet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  batch_id text NOT NULL,
  medicine_name text,
  manufacturer_name text,
  expiry_date date,
  dosage text,
  notes text,
  family_member_id uuid,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, batch_id)
);
ALTER TABLE public.medicine_cabinet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cabinet" ON public.medicine_cabinet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cabinet" ON public.medicine_cabinet FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cabinet" ON public.medicine_cabinet FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cabinet" ON public.medicine_cabinet FOR DELETE USING (auth.uid() = user_id);

-- ═══ Medicine Reviews: consumer ratings ═══
CREATE TABLE public.medicine_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  batch_id text NOT NULL,
  medicine_name text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  review_text text,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, batch_id)
);
ALTER TABLE public.medicine_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reviews" ON public.medicine_reviews FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert own reviews" ON public.medicine_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.medicine_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.medicine_reviews FOR DELETE USING (auth.uid() = user_id);

-- ═══ Family Members: track medicines for family ═══
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL DEFAULT 'other',
  date_of_birth date,
  notes text,
  avatar_emoji text DEFAULT '👤',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family" ON public.family_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own family" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own family" ON public.family_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own family" ON public.family_members FOR DELETE USING (auth.uid() = user_id);

-- ═══ Saved/Favorite Medicines ═══
CREATE TABLE public.medicine_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  batch_id text NOT NULL,
  medicine_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, batch_id)
);
ALTER TABLE public.medicine_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.medicine_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.medicine_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.medicine_favorites FOR DELETE USING (auth.uid() = user_id);
