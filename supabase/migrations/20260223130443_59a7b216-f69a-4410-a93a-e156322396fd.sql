
-- Fix overly permissive INSERT policy on coin_transactions
DROP POLICY IF EXISTS "Service role can insert transactions" ON public.coin_transactions;

CREATE POLICY "Authenticated can insert own transactions"
ON public.coin_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
