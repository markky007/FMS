-- ============================================================================
-- Migration: Update User Roles Enum to 'employee', 'manager', 'admin'
-- ============================================================================

-- 1. Drop existing CHECK constraint on profiles role if any
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add updated CHECK constraint on profiles role
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'manager', 'employee'));

-- 3. Update existing 'staff' roles to 'employee'
UPDATE public.profiles SET role = 'employee' WHERE role = 'staff';

-- Output summary
SELECT role, count(*) FROM public.profiles GROUP BY role;
