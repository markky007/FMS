/**
 * Composable for Delivery Items Management
 * Handles adding items, deleting items, updating items, and uploading attachments
 */

import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import { useStorage } from "@/shared/composables/useStorage";
import { useNotification } from "@/shared/composables/useNotification";
import { APP_CONFIG } from "@/app.config";
import type { DeliveryItem, DeliveryItemCreateInput } from "@/types/models";

export function useDeliveryItems() {
  const { uploadFile, deleteFile } = useStorage();
  const notify = useNotification();
  const isItemLoading = ref(false);

  /** Add item to slip */
  async function addItem(
    input: DeliveryItemCreateInput,
    attachments: File[] = [],
  ): Promise<DeliveryItem | null> {
    isItemLoading.value = true;
    try {
      const payload = {
        delivery_slip_id: input.delivery_slip_id,
        item_number: input.item_number,
        receiver_name: input.receiver_name.trim(),
        receiver_user_id: input.receiver_user_id || null,
        sender_name: input.sender_name.trim(),
        sender_user_id: input.sender_user_id || null,
        document_description: input.document_description.trim(),
        quantity: input.quantity ?? 1,
      };

      const { data, error } = await supabase
        .from("delivery_items")
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(error.message);

      const createdItem = data as DeliveryItem;

      // Handle attachments upload if any
      if (attachments.length > 0) {
        await uploadItemAttachments(createdItem.id, input.delivery_slip_id, attachments);
      }

      return createdItem;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถเพิ่มรายการเอกสารได้";
      notify.error(msg);
      return null;
    } finally {
      isItemLoading.value = false;
    }
  }

  /** Upload attachments for an item */
  async function uploadItemAttachments(
    itemId: string,
    slipId: string,
    files: File[],
  ): Promise<void> {
    const validFiles = files.slice(0, APP_CONFIG.MAX_ATTACHMENTS_PER_ITEM);

    for (const file of validFiles) {
      if (file.size > APP_CONFIG.MAX_ATTACHMENT_SIZE) {
        notify.warning(`ไฟล์ ${file.name} มีขนาดเกิน 5MB (ถูกข้าม)`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const storagePath = `${slipId}/${itemId}/${crypto.randomUUID()}.${fileExt}`;

      const uploadedPath = await uploadFile(
        APP_CONFIG.STORAGE_BUCKETS.ATTACHMENTS,
        storagePath,
        file,
      );

      if (uploadedPath) {
        await supabase.from("item_attachments").insert({
          delivery_item_id: itemId,
          storage_path: uploadedPath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || "image/jpeg",
        });
      }
    }
  }

  /** Delete item from slip */
  async function deleteItem(item: DeliveryItem): Promise<boolean> {
    isItemLoading.value = true;
    try {
      // Delete attachments from storage if any
      if (item.attachments && item.attachments.length > 0) {
        for (const att of item.attachments) {
          await deleteFile(APP_CONFIG.STORAGE_BUCKETS.ATTACHMENTS, att.storage_path);
        }
      }

      const { error } = await supabase
        .from("delivery_items")
        .delete()
        .eq("id", item.id);

      if (error) throw new Error(error.message);

      notify.success(`ลบรายการลำดับที่ ${item.item_number} เรียบร้อยแล้ว`);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถลบรายการได้";
      notify.error(msg);
      return false;
    } finally {
      isItemLoading.value = false;
    }
  }

  return {
    isItemLoading,
    addItem,
    uploadItemAttachments,
    deleteItem,
  };
}
