
-- Shared wishlists
CREATE TABLE public.shared_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'My Wishlist',
  product_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared wishlist by token"
  ON public.shared_wishlists FOR SELECT USING (true);

CREATE POLICY "Users create own shares"
  ON public.shared_wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own shares"
  ON public.shared_wishlists FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own shares"
  ON public.shared_wishlists FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

CREATE TRIGGER trg_shared_wishlists_updated
  BEFORE UPDATE ON public.shared_wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_shared_wishlists_user ON public.shared_wishlists(user_id);

-- Product Q&A
CREATE TABLE public.product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by UUID,
  answered_at TIMESTAMPTZ,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved questions"
  ON public.product_questions FOR SELECT
  USING (approved = true OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can ask"
  ON public.product_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner or admin can update"
  ON public.product_questions FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Owner or admin can delete"
  ON public.product_questions FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE TRIGGER trg_product_questions_updated
  BEFORE UPDATE ON public.product_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_product_questions_product ON public.product_questions(product_id);
