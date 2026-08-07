/**
 * Composable for Admin User Management
 * Handles fetching, creating (via Edge Function or client API), updating users & roles
 */

import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import { useUserDirectoryStore } from "@/stores/user-directory.store";
import { useNotification } from "@/shared/composables/useNotification";
import type { Profile } from "@/types/models";
import type { UserRole } from "@/types/enums";

export interface UserFormInput {
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  department_id?: string | null;
  is_active?: boolean;
}

export function useUserManagement() {
  const userDirectoryStore = useUserDirectoryStore();
  const notify = useNotification();

  const allUsers = ref<Profile[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);

  /** Fetch all profiles for admin with department join */
  async function fetchAllUsers(): Promise<void> {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, department:departments(*)")
        .order("full_name", { ascending: true });

      if (error) throw new Error(error.message);
      allUsers.value = data as Profile[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถโหลดรายชื่อผู้ใช้ได้";
      notify.error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  /** Create user (tries Edge Function first, falls back to direct auth/profile insert) */
  async function createUser(input: UserFormInput): Promise<boolean> {
    isSaving.value = true;
    try {
      // 1. Attempt call to Edge Function 'admin-create-user'
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "admin-create-user",
        {
          body: {
            email: input.email.trim(),
            password: input.password,
            full_name: input.full_name.trim(),
            role: input.role,
            department_id: input.department_id || null
          }
        }
      );

      if (fnError || (fnData && fnData.error)) {
        // Fallback: Client-side auth signup if Edge Function not deployed
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: input.email.trim(),
            password: input.password || "12345678",
            options: {
              data: { full_name: input.full_name.trim() }
            }
          }
        );

        if (authError) {
          throw new Error(authError.message);
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: authData.user.id,
              email: input.email.trim(),
              full_name: input.full_name.trim(),
              role: input.role,
              department_id: input.department_id || null,
              is_active: input.is_active ?? true
            });

          if (profileError) throw new Error(profileError.message);
        }
      }

      notify.success("เพิ่มผู้ใช้งานใหม่สำเร็จ");
      await fetchAllUsers();
      await userDirectoryStore.reload();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างผู้ใช้";
      notify.error(msg);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /** Update existing user profile */
  async function updateUser(
    userId: string,
    input: Partial<UserFormInput>
  ): Promise<boolean> {
    isSaving.value = true;
    try {
      // 1. Attempt call to Edge Function 'admin-update-user'
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "admin-update-user",
        {
          body: {
            userId,
            email: input.email?.trim(),
            password: input.password || undefined,
            full_name: input.full_name?.trim(),
            role: input.role,
            department_id:
              input.department_id !== undefined
                ? input.department_id || null
                : undefined,
            is_active: input.is_active
          }
        }
      );

      if (fnError || (fnData && fnData.error)) {
        // Fallback: Direct table update on `profiles` if Edge Function fails or is not deployed
        const payload: Record<string, unknown> = {};
        if (input.email) payload.email = input.email.trim();
        if (input.full_name) payload.full_name = input.full_name.trim();
        if (input.role) payload.role = input.role;
        if (input.department_id !== undefined)
          payload.department_id = input.department_id || null;
        if (input.is_active !== undefined) payload.is_active = input.is_active;

        const { error: dbError } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", userId);

        if (dbError) throw new Error(dbError.message);
      }

      notify.success("บันทึกข้อมูลผู้ใช้สำเร็จ");
      await fetchAllUsers();
      await userDirectoryStore.reload();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
      notify.error(msg);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /** Toggle user active status (disable / enable account) */
  async function toggleStatus(user: Profile): Promise<void> {
    const newStatus = !user.is_active;
    const success = await updateUser(user.id, { is_active: newStatus });
    if (success) {
      notify.info(
        `${newStatus ? "เปิดใช้งาน" : "ระงับการใช้งาน"} บัญชีของคุณ ${user.full_name} เรียบร้อยแล้ว`
      );
    }
  }

  return {
    allUsers,
    isLoading,
    isSaving,
    fetchAllUsers,
    createUser,
    updateUser,
    toggleStatus
  };
}
