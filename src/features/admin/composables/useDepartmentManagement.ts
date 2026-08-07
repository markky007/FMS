/**
 * Composable for Admin Department Management
 * Handles fetching, creating, and updating departments and branches
 */

import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import { useDepartmentStore } from "@/stores/department.store";
import { useNotification } from "@/shared/composables/useNotification";
import type { Department } from "@/types/models";
import type { DepartmentType } from "@/types/enums";

export interface DepartmentFormInput {
  code: string;
  name: string;
  type: DepartmentType;
  parent_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export function useDepartmentManagement() {
  const departmentStore = useDepartmentStore();
  const notify = useNotification();

  const allDepartments = ref<Department[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);

  /** Fetch all departments (including inactive) for admin */
  async function fetchAllDepartments(): Promise<void> {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("code", { ascending: true });

      if (error) throw new Error(error.message);
      allDepartments.value = data as Department[];
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลแผนกได้";
      notify.error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  /** Create new department */
  async function createDepartment(input: DepartmentFormInput): Promise<boolean> {
    isSaving.value = true;
    try {
      const payload = {
        code: input.code.toUpperCase().trim(),
        name: input.name.trim(),
        type: input.type,
        parent_id: input.parent_id || null,
        sort_order: input.sort_order ?? 0,
        is_active: input.is_active ?? true,
      };

      const { error } = await supabase.from("departments").insert(payload);
      if (error) {
        if (error.code === "23505") {
          throw new Error(`รหัสสาขา/แผนก '${payload.code}' มีอยู่ในระบบแล้ว`);
        }
        throw new Error(error.message);
      }

      notify.success("เพิ่มสาขา/แผนกสำเร็จ");
      await fetchAllDepartments();
      await departmentStore.reload();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      notify.error(msg);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /** Update existing department */
  async function updateDepartment(
    id: string,
    input: Partial<DepartmentFormInput>,
  ): Promise<boolean> {
    isSaving.value = true;
    try {
      const payload: Record<string, unknown> = {};
      if (input.code) payload.code = input.code.toUpperCase().trim();
      if (input.name) payload.name = input.name.trim();
      if (input.type) payload.type = input.type;
      if (input.parent_id !== undefined) payload.parent_id = input.parent_id || null;
      if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
      if (input.is_active !== undefined) payload.is_active = input.is_active;

      const { error } = await supabase
        .from("departments")
        .update(payload)
        .eq("id", id);

      if (error) throw new Error(error.message);

      notify.success("บันทึกการแก้ไขสำเร็จ");
      await fetchAllDepartments();
      await departmentStore.reload();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      notify.error(msg);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /** Toggle active status */
  async function toggleStatus(dept: Department): Promise<void> {
    const newStatus = !dept.is_active;
    const success = await updateDepartment(dept.id, { is_active: newStatus });
    if (success) {
      notify.info(
        `${newStatus ? "เปิดใช้งาน" : "ปิดใช้งาน"} ${dept.name} เรียบร้อยแล้ว`,
      );
    }
  }

  return {
    allDepartments,
    isLoading,
    isSaving,
    fetchAllDepartments,
    createDepartment,
    updateDepartment,
    toggleStatus,
  };
}
