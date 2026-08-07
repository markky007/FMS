/**
 * Auth Pinia Store
 * Manages authentication state, session, and user profile
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/boot/supabase";
import { UserRole } from "@/types/enums";
import type { Profile } from "@/types/models";

export const useAuthStore = defineStore("auth", () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const session = ref<Session | null>(null);
  const profile = ref<Profile | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ─── Computed ───────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => session.value !== null);
  const userId = computed(() => session.value?.user?.id ?? null);
  const role = computed(() => profile.value?.role ?? null);
  const departmentId = computed(() => profile.value?.department_id ?? null);
  const fullName = computed(() => profile.value?.full_name ?? "");

  const isAdmin = computed(() => role.value === UserRole.ADMIN);
  const isManager = computed(() => role.value === UserRole.MANAGER);
  const isStaff = computed(() => role.value === UserRole.STAFF);
  const isManagerOrAdmin = computed(() => isAdmin.value || isManager.value);

  // ─── Actions ────────────────────────────────────────────────────────────────

  /** Load user profile from database */
  async function loadProfile(uid: string): Promise<void> {
    const { data, error: err } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (err) {
      throw new Error(`Failed to load profile: ${err.message}`);
    }

    if (!data.is_active) {
      await logout();
      throw new Error("บัญชีของคุณถูกระงับการใช้งาน");
    }

    profile.value = data as Profile;
  }

  /** Login with email and password */
  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }
        throw new Error(authError.message);
      }

      session.value = data.session;
      await loadProfile(data.user.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Logout and clear all state */
  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    session.value = null;
    profile.value = null;
    error.value = null;
  }

  /** Restore session from persisted storage (called on app boot) */
  async function restoreSession(): Promise<boolean> {
    isLoading.value = true;
    try {
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession) {
        session.value = existingSession;
        await loadProfile(existingSession.user.id);
        return true;
      }
      return false;
    } catch {
      session.value = null;
      profile.value = null;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /** Refresh profile data from database */
  async function refreshProfile(): Promise<void> {
    if (userId.value) {
      await loadProfile(userId.value);
    }
  }

  /** Listen for auth state changes (token refresh, etc.) */
  function setupAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      session.value = newSession;

      if (event === "SIGNED_OUT") {
        profile.value = null;
      } else if (event === "TOKEN_REFRESHED" && newSession) {
        // Session refreshed, profile stays the same
      }
    });
  }

  return {
    // State
    session,
    profile,
    isLoading,
    error,
    // Computed
    isAuthenticated,
    userId,
    role,
    departmentId,
    fullName,
    isAdmin,
    isManager,
    isStaff,
    isManagerOrAdmin,
    // Actions
    login,
    logout,
    restoreSession,
    refreshProfile,
    setupAuthListener,
  };
});
