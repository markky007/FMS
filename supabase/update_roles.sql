-- ============================================================================
-- Migration: Update User Roles Enum to 'employee', 'manager', 'admin'
-- ============================================================================

-- 1. Drop existing CHECK constraint first so updates are allowed
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Migrate existing 'staff' roles to 'employee'
UPDATE public.profiles SET role = 'employee' WHERE role = 'staff' OR role IS NULL;

-- 3. Add updated CHECK constraint (allowing admin, manager, employee, staff)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'manager', 'employee', 'staff'));

-- Output summary of roles
SELECT role, count(*) FROM public.profiles GROUP BY role;
