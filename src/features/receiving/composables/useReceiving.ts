/**
 * Composable for Receiving & Signature Operations
 * Handles fetching pending items, signature upload, atomic signing, and received history
 */

import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { useStorage } from "@/shared/composables/useStorage";
import { useNotification } from "@/shared/composables/useNotification";
import { APP_CONFIG } from "@/app.config";
import type { DeliveryItem } from "@/types/models";

export function useReceiving() {
  const authStore = useAuthStore();
  const { uploadFile } = useStorage();
  const notify = useNotification();

  const pendingItems = ref<DeliveryItem[]>([]);
  const receivedHistory = ref<DeliveryItem[]>([]);
  const isLoading = ref(false);
  const isSigning = ref(false);

  /** Fetch slip IDs where destination (To Department) is current user's department and status is sent/partially_received */
  async function getIncomingDepartmentSlipIds(): Promise<string[]> {
    if (!authStore.departmentId) return [];
    const { data } = await supabase
      .from("delivery_slips")
      .select("id")
      .eq("to_department_id", authStore.departmentId)
      .in("status", ["sent", "partially_received"]);

    return (data || []).map((s) => s.id);
  }

  /** Fetch items pending signature for current user or user's destination department */
  async function fetchPendingItems(): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    try {
      const incomingSlipIds = await getIncomingDepartmentSlipIds();

      let query = supabase
        .from("delivery_items")
        .select(
          `
          *,
          delivery_slip:delivery_slips!delivery_slip_id(
            id,
            slip_number,
            send_date,
            send_time,
            status,
            delivered_by_name,
            from_department:departments!from_department_id(*),
            to_department:departments!to_department_id(*)
          ),
          attachments:item_attachments(*)
        `,
        )
        .eq("is_received", false)
        .order("created_at", { ascending: false });

      if (incomingSlipIds.length > 0) {
        query = query.or(
          `receiver_user_id.eq.${authStore.userId},delivery_slip_id.in.(${incomingSlipIds.join(",")})`,
        );
      } else {
        query = query.eq("receiver_user_id", authStore.userId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const items = (data || []) as DeliveryItem[];

      // Filter out items that are draft or voided or not sent yet
      pendingItems.value = items.filter((item) => {
        const slipStatus = item.delivery_slip?.status;
        return slipStatus === "sent" || slipStatus === "partially_received";
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถโหลดรายการรอรับได้";
      notify.error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  /** Fetch items already signed and received */
  async function fetchReceivedHistory(): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    try {
      const incomingSlipIds = await getIncomingDepartmentSlipIds();

      let query = supabase
        .from("delivery_items")
        .select(
          `
          *,
          delivery_slip:delivery_slips!delivery_slip_id(
            id,
            slip_number,
            send_date,
            delivered_by_name,
            from_department:departments!from_department_id(*),
            to_department:departments!to_department_id(*)
          ),
          signature:signatures!signature_id(*),
          attachments:item_attachments(*)
        `,
        )
        .eq("is_received", true)
        .order("received_at", { ascending: false });

      if (incomingSlipIds.length > 0) {
        query = query.or(
          `received_by_user_id.eq.${authStore.userId},receiver_user_id.eq.${authStore.userId},delivery_slip_id.in.(${incomingSlipIds.join(",")})`,
        );
      } else {
        query = query.or(
          `received_by_user_id.eq.${authStore.userId},receiver_user_id.eq.${authStore.userId}`,
        );
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      receivedHistory.value = (data || []) as DeliveryItem[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถโหลดประวัติการรับได้";
      notify.error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  /** Sign single delivery item */
  async function signItem(
    item: DeliveryItem,
    signatureBlob: Blob,
    signerName: string,
  ): Promise<boolean> {
    if (!authStore.userId) {
      notify.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return false;
    }

    isSigning.value = true;
    try {
      // 1. Upload signature image to Storage
      const fileName = `sig_${item.id}_${Date.now()}.png`;
      const file = new File([signatureBlob], fileName, { type: "image/png" });

      const storagePath = await uploadFile(
        APP_CONFIG.STORAGE_BUCKETS.SIGNATURES,
        fileName,
        file,
      );
      if (!storagePath) throw new Error("อัปโหลดลายเซ็นไม่สำเร็จ");

      // 2. Call RPC to process signature atomically with exact parameter names
      const { error: rpcErr } = await supabase.rpc("sign_delivery_item", {
        p_item_id: item.id,
        p_signature_storage_path: storagePath,
        p_signer_name: signerName,
      });

      if (rpcErr) {
        // Fallback: manual insert into signatures & update delivery_items
        const { data: sigData, error: sigErr } = await supabase
          .from("signatures")
          .insert({
            delivery_item_id: item.id,
            storage_path: storagePath,
            signer_name: signerName,
            signer_user_id: authStore.userId,
          })
          .select()
          .single();

        if (sigErr) throw new Error(`บันทึกลายเซ็นไม่สำเร็จ: ${sigErr.message}`);

        const { error: updateErr } = await supabase
          .from("delivery_items")
          .update({
            is_received: true,
            received_at: new Date().toISOString(),
            received_by_user_id: authStore.userId,
            signature_id: sigData.id,
          })
          .eq("id", item.id);

        if (updateErr) throw new Error(`อัปเดตสถานะไม่สำเร็จ: ${updateErr.message}`);
      }

      notify.success("เซ็นรับเอกสารเรียบร้อยแล้ว");
      await fetchPendingItems();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเซ็นรับ";
      notify.error(msg);
      return false;
    } finally {
      isSigning.value = false;
    }
  }

  /** Batch sign multiple items with single signature */
  async function batchSignItems(
    items: DeliveryItem[],
    signatureBlob: Blob,
    signerName: string,
  ): Promise<boolean> {
    if (items.length === 0) return false;

    let successCount = 0;
    for (const item of items) {
      const ok = await signItem(item, signatureBlob, signerName);
      if (ok) successCount++;
    }

    if (successCount > 0) {
      notify.success(`เซ็นรับเอกสารสำเร็จ ${successCount}/${items.length} รายการ`);
      return true;
    }
    return false;
  }

  return {
    pendingItems,
    receivedHistory,
    isLoading,
    isSigning,
    fetchPendingItems,
    fetchReceivedHistory,
    signItem,
    batchSignItems,
  };
}
