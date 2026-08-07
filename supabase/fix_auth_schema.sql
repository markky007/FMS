-- ============================================================================
-- Fix Supabase GoTrue Auth Schema & Cleanup Corrupted SQL Users
-- ============================================================================

-- 1. Remove manually-inserted test users from profiles and auth.users
DELETE FROM public.profiles WHERE email IN (
  'admin@kcst.co.th',
  'manager@kcst.co.th',
  'sender@kcst.co.th',
  'receiver@kcst.co.th'
);

DELETE FROM auth.users WHERE email IN (
  'admin@kcst.co.th',
  'manager@kcst.co.th',
  'sender@kcst.co.th',
  'receiver@kcst.co.th'
);

-- 2. Ensure Departments exist
INSERT INTO public.departments (code, name, type, sort_order) VALUES
  ('K1', 'สาขา K1', 'branch', 1),
  ('K2', 'สาขา K2', 'branch', 2),
  ('K3', 'สาขา K3', 'branch', 3),
  ('K4', 'สาขา K4', 'branch', 4),
  ('K5', 'สาขา K5', 'branch', 5)
ON CONFLICT (code) DO NOTHING;

-- Output status
SELECT count(*) AS total_auth_users FROM auth.users;
