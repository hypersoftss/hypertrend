
-- Create coin_orders table for manual UPI payment requests
CREATE TABLE public.coin_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    package_id uuid REFERENCES public.coin_packages(id),
    amount integer NOT NULL,
    price_inr numeric NOT NULL,
    utr_number text,
    status text NOT NULL DEFAULT 'pending',
    admin_note text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coin_orders ENABLE ROW LEVEL SECURITY;

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
ON public.coin_orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON public.coin_orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all orders"
ON public.coin_orders FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
