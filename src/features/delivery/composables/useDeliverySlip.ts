/**
 * Composable for Delivery Slip Management
 * Handles creating, updating, submitting, and voiding delivery slips
 */

import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { useDeliverySlipStore } from "@/stores/delivery-slip.store";
import { useNotification } from "@/shared/composables/useNotification";
import { SlipStatus } from "@/types/enums";
import type { DeliverySlipCreateInput } from "@/types/models";

export function useDeliverySlip() {
  const authStore = useAuthStore();
  const slipStore = useDeliverySlipStore();
  const notify = useNotification();

  const isSubmitting = ref(false);

  /** Create a new delivery slip in draft state */
  async function createSlip(
    input: DeliverySlipCreateInput,
  ): Promise<string | null> {
    if (!authStore.userId) {
      notify.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return null;
    }

    isSubmitting.value = true;
    try {
      const payload = {
        from_department_id: input.from_department_id,
        to_department_id: input.to_department_id,
        delivered_by_name: input.delivered_by_name?.trim() || null,
        delivered_by_user_id: input.delivered_by_user_id || null,
        send_date: input.send_date || new Date().toISOString().split("T")[0] || "",
        send_time:
          input.send_time ||
          (new Date().toTimeString().split(" ")[0] || "00:00").substring(0, 5),
        status: input.status || SlipStatus.DRAFT,
        created_by: authStore.userId,
      };

      const { data, error } = await supabase
        .from("delivery_slips")
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(error.message);

      notify.success(`สร้างใบส่งเอกสารเรียบร้อย (เลขที่ ${data.slip_number})`);
      return data.id as string;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างใบส่ง";
      notify.error(msg);
      return null;
    } finally {
      isSubmitting.value = false;
    }
  }

  /** Update slip header info */
  async function updateSlipHeader(
    slipId: string,
    input: Partial<DeliverySlipCreateInput>,
  ): Promise<boolean> {
    isSubmitting.value = true;
    try {
      const payload: Record<string, unknown> = {};
      if (input.from_department_id) payload.from_department_id = input.from_department_id;
      if (input.to_department_id) payload.to_department_id = input.to_department_id;
      if (input.delivered_by_name !== undefined) payload.delivered_by_name = input.delivered_by_name;
      if (input.delivered_by_user_id !== undefined) payload.delivered_by_user_id = input.delivered_by_user_id;
      if (input.send_date) payload.send_date = input.send_date;

      const { error } = await supabase
        .from("delivery_slips")
        .update(payload)
        .eq("id", slipId);

      if (error) throw new Error(error.message);

      notify.success("บันทึกข้อมูลใบส่งเรียบร้อย");
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
      notify.error(msg);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  /** Change slip status to SENT */
  async function sendSlip(slipId: string): Promise<boolean> {
    isSubmitting.value = true;
    try {
      const { error } = await supabase
        .from("delivery_slips")
        .update({ status: SlipStatus.SENT })
        .eq("id", slipId);

      if (error) throw new Error(error.message);

      notify.success("ส่งเอกสารเรียบร้อยแล้ว รายการจะแจ้งไปยังผู้รับ");
      await slipStore.fetchMySlips();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่ง";
      notify.error(msg);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  /** Admin void slip */
  async function voidSlip(slipId: string): Promise<boolean> {
    isSubmitting.value = true;
    try {
      const { error } = await supabase
        .from("delivery_slips")
        .update({ status: SlipStatus.VOIDED })
        .eq("id", slipId);

      if (error) throw new Error(error.message);

      notify.info("ยกเลิกใบส่งเอกสารเรียบร้อยแล้ว");
      await slipStore.fetchMySlips();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการยกเลิก";
      notify.error(msg);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    createSlip,
    updateSlipHeader,
    sendSlip,
    voidSlip,
  };
}
