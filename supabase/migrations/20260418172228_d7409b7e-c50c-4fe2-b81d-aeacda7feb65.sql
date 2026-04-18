
-- ============ COUPONS ============
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percent','fixed','free_shipping')),
  value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INT,
  used_count INT NOT NULL DEFAULT 0,
  per_user_limit INT NOT NULL DEFAULT 1,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_coupons_code ON public.coupons(code);

-- ============ COUPON REDEMPTIONS ============
CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID,
  discount_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own redemptions"
  ON public.coupon_redemptions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX idx_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX idx_redemptions_user ON public.coupon_redemptions(user_id);

-- ============ ORDERS: tracking + coupon ============
ALTER TABLE public.orders
  ADD COLUMN tracking_number TEXT,
  ADD COLUMN carrier TEXT,
  ADD COLUMN tracking_url TEXT,
  ADD COLUMN coupon_code TEXT,
  ADD COLUMN discount_amount NUMERIC NOT NULL DEFAULT 0;

-- ============ ORDER STATUS HISTORY ============
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  changed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins insert order history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (public.is_admin());

CREATE INDEX idx_order_history_order ON public.order_status_history(order_id);

-- Trigger: log status changes automatically
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, status, changed_by, note)
    VALUES (NEW.id, NEW.status, NEW.user_id, 'Order placed');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_status_history
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- ============ APPLY_COUPON RPC ============
CREATE OR REPLACE FUNCTION public.apply_coupon(_code TEXT, _subtotal NUMERIC)
RETURNS TABLE(coupon_id UUID, discount NUMERIC, free_shipping BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _c RECORD;
  _user UUID := auth.uid();
  _user_uses INT;
  _disc NUMERIC := 0;
  _free BOOLEAN := false;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _c FROM public.coupons WHERE upper(code) = upper(_code);
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid coupon code'; END IF;
  IF NOT _c.active THEN RAISE EXCEPTION 'Coupon is not active'; END IF;
  IF _c.starts_at > now() THEN RAISE EXCEPTION 'Coupon not yet valid'; END IF;
  IF _c.expires_at IS NOT NULL AND _c.expires_at < now() THEN RAISE EXCEPTION 'Coupon expired'; END IF;
  IF _subtotal < _c.min_order_amount THEN
    RAISE EXCEPTION 'Minimum order amount is %', _c.min_order_amount;
  END IF;
  IF _c.usage_limit IS NOT NULL AND _c.used_count >= _c.usage_limit THEN
    RAISE EXCEPTION 'Coupon usage limit reached';
  END IF;

  SELECT COUNT(*) INTO _user_uses FROM public.coupon_redemptions
    WHERE coupon_id = _c.id AND user_id = _user;
  IF _user_uses >= _c.per_user_limit THEN
    RAISE EXCEPTION 'You have already used this coupon';
  END IF;

  IF _c.type = 'percent' THEN
    _disc := round(_subtotal * _c.value / 100, 2);
    IF _c.max_discount IS NOT NULL AND _disc > _c.max_discount THEN
      _disc := _c.max_discount;
    END IF;
  ELSIF _c.type = 'fixed' THEN
    _disc := least(_c.value, _subtotal);
  ELSIF _c.type = 'free_shipping' THEN
    _free := true;
    _disc := 0;
  END IF;

  RETURN QUERY SELECT _c.id, _disc, _free, 'OK'::TEXT;
END;
$$;

-- ============ UPDATED PLACE_ORDER ============
CREATE OR REPLACE FUNCTION public.place_order(
  _items JSONB,
  _shipping_address TEXT,
  _shipping_city TEXT,
  _phone TEXT,
  _payment_method TEXT DEFAULT 'cod',
  _coupon_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _order_id UUID;
  _subtotal NUMERIC := 0;
  _shipping NUMERIC := 0;
  _discount NUMERIC := 0;
  _total NUMERIC := 0;
  _item JSONB;
  _product RECORD;
  _qty INT;
  _coupon RECORD;
  _free_ship BOOLEAN := false;
  _user_uses INT;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF jsonb_array_length(_items) = 0 THEN RAISE EXCEPTION 'Cart is empty'; END IF;

  -- Lock + validate stock, compute subtotal
  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'quantity')::INT;
    SELECT id, name, price, stock INTO _product
    FROM public.products WHERE id = (_item->>'product_id')::UUID FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product not found: %', _item->>'product_id'; END IF;
    IF _product.stock < _qty THEN
      RAISE EXCEPTION 'Insufficient stock for %: % available, % requested',
        _product.name, _product.stock, _qty;
    END IF;
    _subtotal := _subtotal + (_product.price * _qty);
  END LOOP;

  _shipping := CASE WHEN _subtotal > 5000 THEN 0 ELSE 250 END;

  -- Coupon
  IF _coupon_code IS NOT NULL AND length(_coupon_code) > 0 THEN
    SELECT * INTO _coupon FROM public.coupons WHERE upper(code) = upper(_coupon_code) FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Invalid coupon'; END IF;
    IF NOT _coupon.active THEN RAISE EXCEPTION 'Coupon inactive'; END IF;
    IF _coupon.expires_at IS NOT NULL AND _coupon.expires_at < now() THEN RAISE EXCEPTION 'Coupon expired'; END IF;
    IF _subtotal < _coupon.min_order_amount THEN
      RAISE EXCEPTION 'Minimum order amount is %', _coupon.min_order_amount;
    END IF;
    IF _coupon.usage_limit IS NOT NULL AND _coupon.used_count >= _coupon.usage_limit THEN
      RAISE EXCEPTION 'Coupon usage limit reached';
    END IF;
    SELECT COUNT(*) INTO _user_uses FROM public.coupon_redemptions
      WHERE coupon_id = _coupon.id AND user_id = _user_id;
    IF _user_uses >= _coupon.per_user_limit THEN
      RAISE EXCEPTION 'You have already used this coupon';
    END IF;

    IF _coupon.type = 'percent' THEN
      _discount := round(_subtotal * _coupon.value / 100, 2);
      IF _coupon.max_discount IS NOT NULL AND _discount > _coupon.max_discount THEN
        _discount := _coupon.max_discount;
      END IF;
    ELSIF _coupon.type = 'fixed' THEN
      _discount := least(_coupon.value, _subtotal);
    ELSIF _coupon.type = 'free_shipping' THEN
      _free_ship := true;
    END IF;

    IF _free_ship THEN _shipping := 0; END IF;
  END IF;

  _total := GREATEST(_subtotal - _discount, 0) + _shipping;

  INSERT INTO public.orders (
    user_id, total_amount, shipping_address, shipping_city, phone,
    payment_method, status, payment_status, coupon_code, discount_amount
  )
  VALUES (
    _user_id, _total, _shipping_address, _shipping_city, _phone,
    _payment_method, 'pending', 'pending',
    CASE WHEN _coupon.id IS NOT NULL THEN _coupon.code ELSE NULL END,
    _discount
  )
  RETURNING id INTO _order_id;

  -- Items + decrement
  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'quantity')::INT;
    SELECT name, price INTO _product FROM public.products WHERE id = (_item->>'product_id')::UUID;
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price)
    VALUES (_order_id, (_item->>'product_id')::UUID, _product.name, _qty, _product.price);
    UPDATE public.products SET stock = stock - _qty WHERE id = (_item->>'product_id')::UUID;
  END LOOP;

  -- Record coupon redemption
  IF _coupon.id IS NOT NULL THEN
    INSERT INTO public.coupon_redemptions (coupon_id, user_id, order_id, discount_amount)
    VALUES (_coupon.id, _user_id, _order_id, _discount);
    UPDATE public.coupons SET used_count = used_count + 1 WHERE id = _coupon.id;
  END IF;

  RETURN _order_id;
END;
$$;

-- Allow admins to view profiles for customer management (already covered by is_admin in profiles policies)
