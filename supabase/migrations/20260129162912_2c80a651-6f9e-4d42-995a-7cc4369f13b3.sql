-- Fix security warnings: Replace overly permissive INSERT policies

-- Drop the permissive policies
DROP POLICY IF EXISTS "Anyone can insert logs" ON public.api_logs;
DROP POLICY IF EXISTS "Anyone can insert activity logs" ON public.activity_logs;

-- Create more restrictive INSERT policies for api_logs
-- Only allow inserts through edge functions (service role) or authenticated users
CREATE POLICY "Authenticated users can insert logs" ON public.api_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create more restrictive INSERT policies for activity_logs  
-- Only allow inserts for authenticated users logging their own activity
CREATE POLICY "Authenticated users can insert their own activity" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');