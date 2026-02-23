
-- Allow admins to delete api_logs (needed for cascading API key deletion)
CREATE POLICY "Admins can delete api logs"
ON public.api_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
