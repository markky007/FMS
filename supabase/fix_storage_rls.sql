-- ============================================================================
-- Fix Storage.Objects RLS Policies for Attachments & Signatures Buckets
-- ============================================================================

-- Drop existing storage.objects policies if any
DROP POLICY IF EXISTS "attachments_public_select" ON storage.objects;
DROP POLICY IF EXISTS "attachments_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "attachments_public_update" ON storage.objects;
DROP POLICY IF EXISTS "attachments_public_delete" ON storage.objects;

DROP POLICY IF EXISTS "signatures_public_select" ON storage.objects;
DROP POLICY IF EXISTS "signatures_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "signatures_public_update" ON storage.objects;
DROP POLICY IF EXISTS "signatures_public_delete" ON storage.objects;

-- Create policies for attachments bucket
CREATE POLICY "attachments_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "attachments_public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "attachments_public_update" ON storage.objects FOR UPDATE USING (bucket_id = 'attachments');
CREATE POLICY "attachments_public_delete" ON storage.objects FOR DELETE USING (bucket_id = 'attachments');

-- Create policies for signatures bucket
CREATE POLICY "signatures_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'signatures');
CREATE POLICY "signatures_public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'signatures');
CREATE POLICY "signatures_public_update" ON storage.objects FOR UPDATE USING (bucket_id = 'signatures');
CREATE POLICY "signatures_public_delete" ON storage.objects FOR DELETE USING (bucket_id = 'signatures');
