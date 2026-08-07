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

  /** Helper: Strip bucket name prefix if path contains it to prevent duplicate path segments */
  function cleanPath(bucket: string, path: string): string {
    const prefix = `${bucket}/`;
    if (path.startsWith(prefix)) {
      return path.substring(prefix.length);
    }
    return path;
  }

  /** Upload file to Supabase Storage bucket */
  async function uploadFile(
    bucket: string,
    path: string,
    file: File,
  ): Promise<string | null> {
    isUploading.value = true;
    try {
      const targetPath = cleanPath(bucket, path);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(targetPath, file, {
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

  /** Generate temporary Signed URL for private file access (with getPublicUrl fallback) */
  async function getSignedUrl(
    bucket: string,
    rawPath: string,
    expirySeconds = APP_CONFIG.SIGNED_URL_EXPIRY,
  ): Promise<string | null> {
    const path = cleanPath(bucket, rawPath);
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expirySeconds);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
      // Fallback to getPublicUrl if createSignedUrl fails or bucket is public
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicData?.publicUrl || null;
    } catch {
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicData?.publicUrl || null;
    }
  }

  /** Delete file from storage bucket */
  async function deleteFile(bucket: string, rawPath: string): Promise<boolean> {
    const path = cleanPath(bucket, rawPath);
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
