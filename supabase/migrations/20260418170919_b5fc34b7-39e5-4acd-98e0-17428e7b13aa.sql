-- ============================================================
-- 1. ADDRESSES TABLE
-- ============================================================
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses"
ON public.addresses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_addresses_user ON public.addresses(user_id);

-- Ensure only one default address per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id <> NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_single_default_address
AFTER INSERT OR UPDATE OF is_default ON public.addresses
FOR EACH ROW WHEN (NEW.is_default = true)
EXECUTE FUNCTION public.ensure_single_default_address();

-- ============================================================
-- 2. PLACE_ORDER RPC — atomic stock decrement
-- ============================================================
CREATE OR REPLACE FUNCTION public.place_order(
  _items JSONB,            -- [{ product_id, quantity }]
  _shipping_address TEXT,
  _shipping_city TEXT,
  _phone TEXT,
  _payment_method TEXT DEFAULT 'cod'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _order_id UUID;
  _total NUMERIC := 0;
  _item JSONB;
  _product RECORD;
  _qty INT;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Lock product rows + validate stock
  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'quantity')::INT;

    SELECT id, name, price, stock INTO _product
    FROM public.products
    WHERE id = (_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', _item->>'product_id';
    END IF;

    IF _product.stock < _qty THEN
      RAISE EXCEPTION 'Insufficient stock for %: % available, % requested',
        _product.name, _product.stock, _qty;
    END IF;

    _total := _total + (_product.price * _qty);
  END LOOP;

  -- Add shipping
  IF _total <= 5000 THEN
    _total := _total + 250;
  END IF;

  -- Create order
  INSERT INTO public.orders (user_id, total_amount, shipping_address, shipping_city, phone, payment_method, status, payment_status)
  VALUES (_user_id, _total, _shipping_address, _shipping_city, _phone, _payment_method, 'pending', 'pending')
  RETURNING id INTO _order_id;

  -- Insert items + decrement stock
  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'quantity')::INT;

    SELECT name, price INTO _product
    FROM public.products
    WHERE id = (_item->>'product_id')::UUID;

    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price)
    VALUES (_order_id, (_item->>'product_id')::UUID, _product.name, _qty, _product.price);

    UPDATE public.products
    SET stock = stock - _qty
    WHERE id = (_item->>'product_id')::UUID;
  END LOOP;

  RETURN _order_id;
END;
$$;

-- ============================================================
-- 3. CANCEL_ORDER RPC — restock + cancel
-- ============================================================
CREATE OR REPLACE FUNCTION public.cancel_order(_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _order RECORD;
  _item RECORD;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _order FROM public.orders WHERE id = _order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Owner can cancel pending; admin can cancel anything not delivered
  IF _order.user_id <> _user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF _order.status = 'cancelled' THEN
    RAISE EXCEPTION 'Order already cancelled';
  END IF;

  IF _order.status = 'delivered' THEN
    RAISE EXCEPTION 'Cannot cancel a delivered order';
  END IF;

  -- Customers can only cancel pending orders
  IF _order.user_id = _user_id AND NOT public.is_admin() AND _order.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending orders can be cancelled';
  END IF;

  -- Restock
  FOR _item IN
    SELECT product_id, quantity FROM public.order_items
    WHERE order_id = _order_id AND product_id IS NOT NULL
  LOOP
    UPDATE public.products
    SET stock = stock + _item.quantity
    WHERE id = _item.product_id;
  END LOOP;

  UPDATE public.orders
  SET status = 'cancelled', updated_at = now()
  WHERE id = _order_id;
END;
$$;