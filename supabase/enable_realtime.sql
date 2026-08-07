-- ============================================================================
-- Enable Supabase Realtime Publication for Delivery Slips, Items & Signatures
-- ============================================================================

-- Drop if existing to prevent duplicates
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.delivery_slips;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.delivery_items;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.signatures;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_slips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signatures;

-- Set REPLICA IDENTITY FULL for detailed change payload
ALTER TABLE public.delivery_slips REPLICA IDENTITY FULL;
ALTER TABLE public.delivery_items REPLICA IDENTITY FULL;
ALTER TABLE public.signatures REPLICA IDENTITY FULL;
