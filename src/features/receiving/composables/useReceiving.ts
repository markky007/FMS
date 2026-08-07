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

  /** Fetch items pending signature for current user or user's department */
  async function fetchPendingItems(): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    try {
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

      // Filter: Receiver is current user OR user's department is the target
      if (authStore.departmentId) {
        query = query.or(
          `receiver_user_id.eq.${authStore.userId},delivery_slip.to_department_id.eq.${authStore.departmentId}`,
        );
      } else {
        query = query.eq("receiver_user_id", authStore.userId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      pendingItems.value = (data || []) as DeliveryItem[];
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
          signature:signatures(*),
          attachments:item_attachments(*)
        `,
        )
        .eq("is_received", true)
        .order("received_at", { ascending: false });

      if (authStore.departmentId) {
        query = query.or(
          `received_by_user_id.eq.${authStore.userId},receiver_user_id.eq.${authStore.userId},delivery_slip.to_department_id.eq.${authStore.departmentId}`,
        );
      } else {
        query = query.eq("received_by_user_id", authStore.userId);
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
    if (!authStore.userId) return false;

    isSigning.value = true;
    try {
      // 1. Upload signature PNG to Storage
      const file = new File([signatureBlob], `signature_${item.id}.png`, {
        type: "image/png",
      });

      const storagePath = `${item.delivery_slip_id}/${item.id}/signature.png`;

      const uploadedPath = await uploadFile(
        APP_CONFIG.STORAGE_BUCKETS.SIGNATURES,
        storagePath,
        file,
      );

      if (!uploadedPath) {
        throw new Error("ไม่สามารถบันทึกไฟล์ลายเซ็นได้");
      }

      // 2. Try DB function `sign_delivery_item` RPC
      const { error: rpcError } = await supabase.rpc("sign_delivery_item", {
        p_item_id: item.id,
        p_signature_storage_path: uploadedPath,
        p_signer_name: signerName,
      });

      if (rpcError) {
        // Fallback: direct insert signature + update item if RPC not deployed yet
        const { data: sigData, error: sigErr } = await supabase
          .from("signatures")
          .insert({
            delivery_item_id: item.id,
            storage_path: uploadedPath,
            signer_name: signerName,
            signer_user_id: authStore.userId,
          })
          .select()
          .single();

        if (sigErr) throw new Error(sigErr.message);

        const { error: updateErr } = await supabase
          .from("delivery_items")
          .update({
            is_received: true,
            received_at: new Date().toISOString(),
            received_by_user_id: authStore.userId,
            signature_id: sigData.id,
          })
          .eq("id", item.id);

        if (updateErr) throw new Error(updateErr.message);
      }

      notify.success(`เซ็นรับเอกสาร '${item.document_description}' เรียบร้อยแล้ว`);
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

  /** Batch sign multiple items using same signature */
  async function batchSignItems(
    itemsToSign: DeliveryItem[],
    signatureBlob: Blob,
    signerName: string,
  ): Promise<boolean> {
    if (itemsToSign.length === 0) return false;

    let successCount = 0;
    for (const item of itemsToSign) {
      const ok = await signItem(item, signatureBlob, signerName);
      if (ok) successCount++;
    }

    if (successCount > 0) {
      notify.success(`เซ็นรับเอกสารสำเร็จ ${successCount} รายการ`);
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
