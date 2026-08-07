-- ============================================================================
-- KCST Document Delivery Tracking System — Database Initial Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & CONSTANTS
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- 2. TABLES
-- ----------------------------------------------------------------------------

-- 2.1 DEPARTMENTS (Branches & Sub-departments)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('branch', 'department')),
  parent_id UUID REFERENCES public.departments(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 PROFILES (User Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  department_id UUID REFERENCES public.departments(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 DELIVERY SLIPS
CREATE TABLE IF NOT EXISTS public.delivery_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slip_number TEXT NOT NULL UNIQUE,
  from_department_id UUID NOT NULL REFERENCES public.departments(id),
  to_department_id UUID NOT NULL REFERENCES public.departments(id),
  delivered_by_name TEXT,
  delivered_by_user_id UUID REFERENCES public.profiles(id),
  send_date DATE NOT NULL DEFAULT CURRENT_DATE,
  send_time TIME,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partially_received', 'fully_received', 'voided')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 SIGNATURES (Created before delivery_items references it, or cross-referenced)
CREATE TABLE IF NOT EXISTS public.signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_item_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_user_id UUID NOT NULL REFERENCES public.profiles(id),
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 DELIVERY ITEMS
CREATE TABLE IF NOT EXISTS public.delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_slip_id UUID NOT NULL REFERENCES public.delivery_slips(id) ON DELETE CASCADE,
  item_number INT NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_user_id UUID REFERENCES public.profiles(id),
  sender_name TEXT NOT NULL,
  sender_user_id UUID REFERENCES public.profiles(id),
  document_description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  is_received BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ,
  received_by_user_id UUID REFERENCES public.profiles(id),
  signature_id UUID REFERENCES public.signatures(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_slip_item_number UNIQUE (delivery_slip_id, item_number)
);

-- Foreign key back for signatures -> delivery_items
ALTER TABLE public.signatures
  ADD CONSTRAINT fk_signatures_item
  FOREIGN KEY (delivery_item_id) REFERENCES public.delivery_items(id) ON DELETE CASCADE,
  ADD CONSTRAINT uk_signatures_item UNIQUE (delivery_item_id);

-- 2.6 ITEM ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.item_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_item_id UUID NOT NULL REFERENCES public.delivery_items(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'sign', 'void')),
  old_data JSONB,
  new_data JSONB,
  performed_by UUID NOT NULL REFERENCES public.profiles(id),
  ip_address TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON public.departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_slips_created_by ON public.delivery_slips(created_by);
CREATE INDEX IF NOT EXISTS idx_slips_status ON public.delivery_slips(status);
CREATE INDEX IF NOT EXISTS idx_slips_send_date ON public.delivery_slips(send_date DESC);
CREATE INDEX IF NOT EXISTS idx_slips_from_dept ON public.delivery_slips(from_department_id);
CREATE INDEX IF NOT EXISTS idx_slips_to_dept ON public.delivery_slips(to_department_id);
CREATE INDEX IF NOT EXISTS idx_items_slip ON public.delivery_items(delivery_slip_id);
CREATE INDEX IF NOT EXISTS idx_items_receiver ON public.delivery_items(receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_items_received ON public.delivery_items(is_received);
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON public.audit_logs(performed_at DESC);

-- ----------------------------------------------------------------------------
-- 4. SEQUENCE & HELPER FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS slip_number_seq START WITH 1 INCREMENT BY 1;

-- Function: Generate Slip Number (KCST-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_slip_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  next_val INT;
BEGIN
  IF NEW.slip_number IS NULL OR NEW.slip_number = '' THEN
    current_year := to_char(CURRENT_DATE, 'YYYY');
    SELECT nextval('slip_number_seq') INTO next_val;
    NEW.slip_number := 'KCST-' || current_year || '-' || lpad(next_val::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_slip_number
  BEFORE INSERT ON public.delivery_slips
  FOR EACH ROW
  EXECUTE FUNCTION generate_slip_number();

-- Function: Automatic Timestamp Updater
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_depts_timestamp BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_slips_timestamp BEFORE UPDATE ON public.delivery_slips FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_items_timestamp BEFORE UPDATE ON public.delivery_items FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function: Auto Update Slip Status when Items are Received
CREATE OR REPLACE FUNCTION update_slip_status_on_item_receive()
RETURNS TRIGGER AS $$
DECLARE
  total_count INT;
  received_count INT;
  target_slip_id UUID;
BEGIN
  target_slip_id := NEW.delivery_slip_id;

  SELECT count(*), count(*) FILTER (WHERE is_received = true)
  INTO total_count, received_count
  FROM public.delivery_items
  WHERE delivery_slip_id = target_slip_id;

  IF total_count > 0 THEN
    IF received_count = total_count THEN
      UPDATE public.delivery_slips SET status = 'fully_received' WHERE id = target_slip_id;
    ELSIF received_count > 0 THEN
      UPDATE public.delivery_slips SET status = 'partially_received' WHERE id = target_slip_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_slip_status
  AFTER UPDATE OF is_received ON public.delivery_items
  FOR EACH ROW
  WHEN (OLD.is_received IS DISTINCT FROM NEW.is_received AND NEW.is_received = true)
  EXECUTE FUNCTION update_slip_status_on_item_receive();

-- Helper Role Check Functions
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_my_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
  SELECT get_my_role() IN ('admin', 'manager');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Atomic Sign Item Procedure Function
CREATE OR REPLACE FUNCTION sign_delivery_item(
  p_item_id UUID,
  p_signature_storage_path TEXT,
  p_signer_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_sig_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  -- Insert signature
  INSERT INTO public.signatures (delivery_item_id, storage_path, signer_name, signer_user_id)
  VALUES (p_item_id, p_signature_storage_path, p_signer_name, v_user_id)
  RETURNING id INTO v_sig_id;

  -- Update delivery item
  UPDATE public.delivery_items
  SET is_received = true,
      received_at = now(),
      received_by_user_id = v_user_id,
      signature_id = v_sig_id
  WHERE id = p_item_id;

  RETURN v_sig_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles Policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_authenticated" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_authenticated" ON public.profiles FOR UPDATE USING (true);

-- 5.2 Departments Policies
CREATE POLICY "depts_select" ON public.departments FOR SELECT USING (true);
CREATE POLICY "depts_all_admin" ON public.departments FOR ALL USING (true);

-- 5.3 Delivery Slips Policies
CREATE POLICY "slips_select_all" ON public.delivery_slips FOR SELECT USING (true);
CREATE POLICY "slips_insert" ON public.delivery_slips FOR INSERT WITH CHECK (true);
CREATE POLICY "slips_update_creator" ON public.delivery_slips FOR UPDATE USING (true);

-- 5.4 Delivery Items Policies
CREATE POLICY "items_select" ON public.delivery_items FOR SELECT USING (true);
CREATE POLICY "items_insert_creator" ON public.delivery_items FOR INSERT WITH CHECK (true);
CREATE POLICY "items_update" ON public.delivery_items FOR UPDATE USING (true);
CREATE POLICY "items_delete_creator" ON public.delivery_items FOR DELETE USING (true);

-- 5.5 Attachments Policies
CREATE POLICY "attach_select" ON public.item_attachments FOR SELECT USING (true);
CREATE POLICY "attach_insert" ON public.item_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "attach_delete" ON public.item_attachments FOR DELETE USING (true);

-- 5.6 Signatures Policies
CREATE POLICY "sig_select" ON public.signatures FOR SELECT USING (true);
CREATE POLICY "sig_insert" ON public.signatures FOR INSERT WITH CHECK (true);

-- 5.7 Audit Logs Policies
CREATE POLICY "audit_select_admin" ON public.audit_logs FOR SELECT USING (is_admin());

-- ----------------------------------------------------------------------------
-- 6. SEED INITIAL DEPARTMENTS
-- ----------------------------------------------------------------------------
INSERT INTO public.departments (code, name, type, sort_order) VALUES
  ('K1', 'สาขา K1', 'branch', 1),
  ('K2', 'สาขา K2', 'branch', 2),
  ('K3', 'สาขา K3', 'branch', 3),
  ('K4', 'สาขา K4', 'branch', 4),
  ('K5', 'สาขา K5', 'branch', 5)
ON CONFLICT (code) DO NOTHING;
