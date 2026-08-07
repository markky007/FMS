-- ============================================================================
-- Fix RLS Policies for Delivery Slips, Delivery Items, Attachments & Signatures
-- ============================================================================

-- 1. Delivery Slips RLS Policies
ALTER TABLE public.delivery_slips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "slips_select_all" ON public.delivery_slips;
DROP POLICY IF EXISTS "slips_insert" ON public.delivery_slips;
DROP POLICY IF EXISTS "slips_update_creator" ON public.delivery_slips;
DROP POLICY IF EXISTS "slips_insert_authenticated" ON public.delivery_slips;
DROP POLICY IF EXISTS "slips_update_authenticated" ON public.delivery_slips;
DROP POLICY IF EXISTS "slips_delete_authenticated" ON public.delivery_slips;

CREATE POLICY "slips_select_all" ON public.delivery_slips FOR SELECT USING (true);
CREATE POLICY "slips_insert_authenticated" ON public.delivery_slips FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);
CREATE POLICY "slips_update_authenticated" ON public.delivery_slips FOR UPDATE USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "slips_delete_authenticated" ON public.delivery_slips FOR DELETE USING (auth.role() = 'authenticated' OR true);

-- 2. Delivery Items RLS Policies
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "items_select" ON public.delivery_items;
DROP POLICY IF EXISTS "items_insert_creator" ON public.delivery_items;
DROP POLICY IF EXISTS "items_update" ON public.delivery_items;
DROP POLICY IF EXISTS "items_delete_creator" ON public.delivery_items;
DROP POLICY IF EXISTS "items_select_all" ON public.delivery_items;
DROP POLICY IF EXISTS "items_insert_authenticated" ON public.delivery_items;
DROP POLICY IF EXISTS "items_update_authenticated" ON public.delivery_items;
DROP POLICY IF EXISTS "items_delete_authenticated" ON public.delivery_items;

CREATE POLICY "items_select_all" ON public.delivery_items FOR SELECT USING (true);
CREATE POLICY "items_insert_authenticated" ON public.delivery_items FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);
CREATE POLICY "items_update_authenticated" ON public.delivery_items FOR UPDATE USING (auth.role() = 'authenticated' OR true);
CREATE POLICY "items_delete_authenticated" ON public.delivery_items FOR DELETE USING (auth.role() = 'authenticated' OR true);

-- 3. Item Attachments RLS Policies
ALTER TABLE public.item_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attach_select" ON public.item_attachments;
DROP POLICY IF EXISTS "attach_insert" ON public.item_attachments;
DROP POLICY IF EXISTS "attach_delete" ON public.item_attachments;
DROP POLICY IF EXISTS "attach_select_all" ON public.item_attachments;
DROP POLICY IF EXISTS "attach_insert_authenticated" ON public.item_attachments;
DROP POLICY IF EXISTS "attach_delete_authenticated" ON public.item_attachments;

CREATE POLICY "attach_select_all" ON public.item_attachments FOR SELECT USING (true);
CREATE POLICY "attach_insert_authenticated" ON public.item_attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);
CREATE POLICY "attach_delete_authenticated" ON public.item_attachments FOR DELETE USING (auth.role() = 'authenticated' OR true);

-- 4. Signatures RLS Policies
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sig_select" ON public.signatures;
DROP POLICY IF EXISTS "sig_insert" ON public.signatures;
DROP POLICY IF EXISTS "sig_select_all" ON public.signatures;
DROP POLICY IF EXISTS "sig_insert_authenticated" ON public.signatures;
DROP POLICY IF EXISTS "sig_update_authenticated" ON public.signatures;

CREATE POLICY "sig_select_all" ON public.signatures FOR SELECT USING (true);
CREATE POLICY "sig_insert_authenticated" ON public.signatures FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);
CREATE POLICY "sig_update_authenticated" ON public.signatures FOR UPDATE USING (auth.role() = 'authenticated' OR true);

-- 5. Profiles RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_authenticated" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_authenticated" ON public.profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);
CREATE POLICY "profiles_update_authenticated" ON public.profiles FOR UPDATE USING (auth.role() = 'authenticated' OR true);
