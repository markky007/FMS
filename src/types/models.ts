/**
 * Application-level model interfaces
 * Represents the shape of data used in the frontend
 */

import type { UserRole, SlipStatus, DepartmentType } from "./enums";

// ─── Profile ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined
  department?: Department;
}

/** Lightweight profile for dropdowns and lists */
export interface ProfileSummary {
  id: string;
  full_name: string;
  email: string;
  department_id: string | null;
}

// ─── Department ─────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  code: string;
  name: string;
  type: DepartmentType;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Delivery Slip ──────────────────────────────────────────────────────────

export interface DeliverySlip {
  id: string;
  slip_number: string;
  from_department_id: string;
  to_department_id: string;
  delivered_by_name: string | null;
  delivered_by_user_id: string | null;
  send_date: string;
  send_time: string | null;
  status: SlipStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  // joined
  from_department?: Department;
  to_department?: Department;
  creator?: ProfileSummary;
  items?: DeliveryItem[];
  item_count?: number;
}

export interface DeliverySlipCreateInput {
  from_department_id: string;
  to_department_id: string;
  delivered_by_name?: string;
  delivered_by_user_id?: string;
  send_date?: string;
  send_time?: string;
  status?: SlipStatus;
}

// ─── Delivery Item ──────────────────────────────────────────────────────────

export interface DeliveryItem {
  id: string;
  delivery_slip_id: string;
  item_number: number;
  receiver_name: string;
  receiver_user_id: string | null;
  sender_name: string;
  sender_user_id: string | null;
  document_description: string;
  quantity: number;
  is_received: boolean;
  received_at: string | null;
  received_by_user_id: string | null;
  signature_id: string | null;
  created_at: string;
  updated_at: string;
  // joined
  attachments?: ItemAttachment[];
  signature?: Signature;
}

export interface DeliveryItemCreateInput {
  delivery_slip_id: string;
  item_number: number;
  receiver_name: string;
  receiver_user_id?: string;
  sender_name: string;
  sender_user_id?: string;
  document_description: string;
  quantity?: number;
}

// ─── Attachment ─────────────────────────────────────────────────────────────

export interface ItemAttachment {
  id: string;
  delivery_item_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  // runtime
  signed_url?: string;
}

// ─── Signature ──────────────────────────────────────────────────────────────

export interface Signature {
  id: string;
  delivery_item_id: string;
  storage_path: string;
  signer_name: string;
  signer_user_id: string;
  signed_at: string;
  // runtime
  signed_url?: string;
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  performed_by: string;
  ip_address: string | null;
  performed_at: string;
  // joined
  performer?: ProfileSummary;
}

// ─── Filters ────────────────────────────────────────────────────────────────

export interface SlipFilters {
  date_from?: string;
  date_to?: string;
  status?: SlipStatus;
  from_department_id?: string;
  to_department_id?: string;
  search?: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  today_sent: number;
  today_received: number;
  pending_count: number;
  month_total: number;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface DepartmentBreakdown {
  department_id: string;
  department_name: string;
  department_code: string;
  count: number;
}
