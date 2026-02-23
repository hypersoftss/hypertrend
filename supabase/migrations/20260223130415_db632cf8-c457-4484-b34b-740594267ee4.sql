
-- Add 'reseller' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reseller';

-- Add coin fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coin_balance integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS coin_cost_per_key integer NOT NULL DEFAULT 500;

-- Create coin_packages table (admin-defined fixed packages)
CREATE TABLE IF NOT EXISTS public.coin_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    coins integer NOT NULL,
    price_inr numeric(10,2) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
ON public.coin_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage packages"
ON public.coin_packages FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create coin_transactions table
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL CHECK (type IN ('credit', 'debit')),
    reason text NOT NULL,
    package_id uuid REFERENCES public.coin_packages(id),
    api_key_id uuid REFERENCES public.api_keys(id),
    admin_id uuid,
    balance_after integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all transactions"
ON public.coin_transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own transactions"
ON public.coin_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
ON public.coin_transactions FOR INSERT
WITH CHECK (true);
