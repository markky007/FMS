/**
 * User Directory Pinia Store
 * Manages the list of users for dropdowns / receiver selection
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/boot/supabase";
import type { ProfileSummary } from "@/types/models";

export const useUserDirectoryStore = defineStore("user-directory", () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const users = ref<ProfileSummary[]>([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  // ─── Computed ───────────────────────────────────────────────────────────────

  /** All users as select options */
  const userOptions = computed(() =>
    users.value.map((u) => ({
      label: u.full_name,
      value: u.id,
    })),
  );

  // ─── Actions ────────────────────────────────────────────────────────────────

  /** Fetch all active users (summary only) */
  async function fetchAll(): Promise<void> {
    if (isLoaded.value) return;

    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, department_id")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (error) {
        throw new Error(`Failed to load users: ${error.message}`);
      }

      users.value = data as ProfileSummary[];
      isLoaded.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  /** Force reload users */
  async function reload(): Promise<void> {
    isLoaded.value = false;
    await fetchAll();
  }

  /** Get users by department */
  function getUsersByDept(deptId: string): ProfileSummary[] {
    return users.value.filter((u) => u.department_id === deptId);
  }

  /** Search users by name (client-side filter) */
  function searchUsers(query: string): ProfileSummary[] {
    const q = query.toLowerCase().trim();
    if (!q) return users.value;
    return users.value.filter((u) => u.full_name.toLowerCase().includes(q));
  }

  /** Find user by ID */
  function getUserById(id: string): ProfileSummary | undefined {
    return users.value.find((u) => u.id === id);
  }

  return {
    // State
    users,
    isLoaded,
    isLoading,
    // Computed
    userOptions,
    // Actions
    fetchAll,
    reload,
    getUsersByDept,
    searchUsers,
    getUserById,
  };
});
