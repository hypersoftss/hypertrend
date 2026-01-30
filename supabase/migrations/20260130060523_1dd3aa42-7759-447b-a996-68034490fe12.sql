-- Add telegram_id to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);