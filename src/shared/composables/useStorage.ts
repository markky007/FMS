/**
 * Storage Helper Composable
 * Handles file upload, deletion, and signed URL generation for attachments and signatures
 */

import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import { APP_CONFIG } from "@/app.config";
import { useNotification } from "./useNotification";

export function useStorage() {
  const notify = useNotification();
  const isUploading = ref(false);

  /** Upload file to Supabase Storage bucket */
  async function uploadFile(
    bucket: string,
    path: string,
    file: File,
  ): Promise<string | null> {
    isUploading.value = true;
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw new Error(error.message);
      return data.path;
    } catch (err) {
      let msg = err instanceof Error ? err.message : "ไม่สามารถอัปโหลดไฟล์ได้";
      if (msg.includes("Bucket not found") || msg.includes("The resource was not found")) {
        msg = `ไม่พบ Storage Bucket '${bucket}' ใน Supabase (กรุณาสร้าง Bucket ใน Supabase Storage)`;
      }
      notify.error(msg);
      return null;
    } finally {
      isUploading.value = false;
    }
  }

  /** Generate temporary Signed URL for private file access */
  async function getSignedUrl(
    bucket: string,
    path: string,
    expirySeconds = APP_CONFIG.SIGNED_URL_EXPIRY,
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expirySeconds);

      if (error) throw new Error(error.message);
      return data.signedUrl;
    } catch {
      return null;
    }
  }

  /** Delete file from storage bucket */
  async function deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw new Error(error.message);
      return true;
    } catch {
      return false;
    }
  }

  return {
    isUploading,
    uploadFile,
    getSignedUrl,
    deleteFile,
  };
}
