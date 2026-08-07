/**
 * Department Pinia Store
 * Manages department/branch data (loaded once on boot)
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/boot/supabase";
import { DepartmentType } from "@/types/enums";
import type { Department } from "@/types/models";

export const useDepartmentStore = defineStore("department", () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const departments = ref<Department[]>([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  // ─── Computed ───────────────────────────────────────────────────────────────

  /** All active branches (top-level) */
  const branches = computed(() =>
    departments.value.filter((d) => d.type === DepartmentType.BRANCH),
  );

  /** All active departments (under branches) */
  const subDepartments = computed(() =>
    departments.value.filter((d) => d.type === DepartmentType.DEPARTMENT),
  );

  // ─── Actions ────────────────────────────────────────────────────────────────

  /** Fetch all active departments from database */
  async function fetchAll(): Promise<void> {
    if (isLoaded.value) return; // Already loaded, skip

    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("code", { ascending: true });

      if (error) {
        throw new Error(`Failed to load departments: ${error.message}`);
      }

      departments.value = data as Department[];
      isLoaded.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  /** Force reload departments (after admin changes) */
  async function reload(): Promise<void> {
    isLoaded.value = false;
    await fetchAll();
  }

  /** Get departments under a specific branch */
  function getDeptsByBranch(branchId: string): Department[] {
    return departments.value.filter((d) => d.parent_id === branchId);
  }

  /** Find department by ID */
  function getDeptById(id: string): Department | undefined {
    return departments.value.find((d) => d.id === id);
  }

  /** Find department by code */
  function getDeptByCode(code: string): Department | undefined {
    return departments.value.find((d) => d.code === code);
  }

  return {
    // State
    departments,
    isLoaded,
    isLoading,
    // Computed
    branches,
    subDepartments,
    // Actions
    fetchAll,
    reload,
    getDeptsByBranch,
    getDeptById,
    getDeptByCode,
  };
});
