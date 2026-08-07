-- ============================================================================
-- KCST Document Delivery System — Test Users & Seed Data
-- ============================================================================

-- Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure branches K1 - K5 exist
INSERT INTO public.departments (code, name, type, sort_order) VALUES
  ('K1', 'สาขา K1', 'branch', 1),
  ('K2', 'สาขา K2', 'branch', 2),
  ('K3', 'สาขา K3', 'branch', 3),
  ('K4', 'สาขา K4', 'branch', 4),
  ('K5', 'สาขา K5', 'branch', 5)
ON CONFLICT (code) DO NOTHING;

-- Function to seed user into auth.users + public.profiles
CREATE OR REPLACE FUNCTION seed_test_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_dept_code TEXT
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_dept_id UUID;
  v_encrypted_pw TEXT;
BEGIN
  -- Get department ID
  SELECT id INTO v_dept_id FROM public.departments WHERE code = p_dept_code LIMIT 1;

  -- Generate hash using blowfish crypt
  v_encrypted_pw := crypt(p_password, gen_salt('bf'));

  -- Check if user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    -- 1. Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      p_email,
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  ELSE
    -- Update existing user password
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pw,
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- 2. Upsert into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department_id,
    is_active
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_role,
    v_dept_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department_id = EXCLUDED.department_id,
    is_active = true,
    updated_at = now();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- CREATE 4 TEST USER ACCOUNTS (Password: Password123!)
-- ----------------------------------------------------------------------------

-- 1. ADMIN USER
SELECT seed_test_user(
  'admin@kcst.co.th',
  'Password123!',
  'สมชาย ผู้ดูแลระบบ (Admin)',
  'admin',
  'K1'
);

-- 2. MANAGER USER
SELECT seed_test_user(
  'manager@kcst.co.th',
  'Password123!',
  'วิชัย ผู้จัดการสาขา (Manager)',
  'manager',
  'K4'
);

-- 3. SENDER STAFF USER (พนักงานผู้ส่ง)
SELECT seed_test_user(
  'sender@kcst.co.th',
  'Password123!',
  'ศศินันท์ พนักงานจัดส่ง (Sender K4)',
  'staff',
  'K4'
);

-- 4. RECEIVER STAFF USER (พนักงานผู้รับ)
SELECT seed_test_user(
  'receiver@kcst.co.th',
  'Password123!',
  'นภา พนักงานปลายทาง (Receiver K5)',
  'staff',
  'K5'
);

-- Clean up helper function
DROP FUNCTION IF EXISTS seed_test_user(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Output confirmation
SELECT id, email, full_name, role, department_id, is_active FROM public.profiles;
