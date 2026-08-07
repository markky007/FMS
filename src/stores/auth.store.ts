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

/** Pre-configured test accounts mapping for initial profile seeding */
const TEST_ACCOUNTS_MAP: Record<
  string,
  { name: string; role: UserRole; deptCode: string }
> = {
  "admin@kcst.co.th": {
    name: "สมชาย ผู้ดูแลระบบ (Admin)",
    role: UserRole.ADMIN,
    deptCode: "K1"
  },
  "manager@kcst.co.th": {
    name: "วิชัย ผู้จัดการสาขา (Manager)",
    role: UserRole.MANAGER,
    deptCode: "K4"
  },
  "sender@kcst.co.th": {
    name: "ศศินันท์ พนักงานจัดส่ง (Sender K4)",
    role: UserRole.EMPLOYEE,
    deptCode: "K4"
  },
  "receiver@kcst.co.th": {
    name: "นภา พนักงานปลายทาง (Receiver K5)",
    role: UserRole.EMPLOYEE,
    deptCode: "K5"
  }
};

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
  const isEmployee = computed(() => role.value === UserRole.EMPLOYEE);
  const isStaff = computed(() => isEmployee.value);
  const isManagerOrAdmin = computed(() => isAdmin.value || isManager.value);

  // ─── Actions ────────────────────────────────────────────────────────────────

  /** Load or auto-create profile if missing */
  async function loadProfile(
    uid: string,
    emailHint?: string
  ): Promise<Profile> {
    const { data } = await supabase
      .from("profiles")
      .select("*, department:departments(*)")
      .eq("id", uid)
      .maybeSingle();

    if (data) {
      if (!data.is_active) {
        await logout();
        throw new Error("บัญชีของคุณถูกระงับการใช้งาน");
      }
      profile.value = data as Profile;
      return data as Profile;
    }

    // Auto-create profile row if user authenticated but missing in profiles table
    const targetEmail = emailHint || session.value?.user?.email || "";
    const testMeta = TEST_ACCOUNTS_MAP[targetEmail.toLowerCase()];

    let deptId: string | null = null;
    if (testMeta?.deptCode) {
      const { data: deptData } = await supabase
        .from("departments")
        .select("id")
        .eq("code", testMeta.deptCode)
        .maybeSingle();
      if (deptData) deptId = deptData.id;
    }

    const newProfilePayload = {
      id: uid,
      email: targetEmail,
      full_name:
        testMeta?.name ||
        session.value?.user?.user_metadata?.full_name ||
        targetEmail.split("@")[0] ||
        "ผู้ใช้งาน",
      role: testMeta?.role || UserRole.EMPLOYEE,
      department_id: deptId,
      is_active: true
    };

    const { data: insertedData, error: insertErr } = await supabase
      .from("profiles")
      .upsert(newProfilePayload)
      .select()
      .single();

    if (insertErr) {
      throw new Error(`ไม่สามารถสร้างโปรไฟล์ผู้ใช้ได้: ${insertErr.message}`);
    }

    profile.value = insertedData as Profile;
    return insertedData as Profile;
  }

  /** Standard login with email and password */
  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

      if (authError) {
        if (
          authError.message.includes("Invalid login credentials") ||
          authError.status === 400
        ) {
          throw new Error(
            "อีเมลหรือรหัสผ่านไม่ถูกต้อง (กรุณาตรวจสอบบัญชีผู้ใช้ใน Supabase Auth)"
          );
        }
        throw new Error(authError.message);
      }

      if (authData.session && authData.user) {
        session.value = authData.session;
        await loadProfile(authData.user.id, cleanEmail);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Logout and clear state */
  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    session.value = null;
    profile.value = null;
    error.value = null;
  }

  /** Restore session on app boot */
  async function restoreSession(): Promise<boolean> {
    isLoading.value = true;
    try {
      const {
        data: { session: existingSession }
      } = await supabase.auth.getSession();

      if (existingSession) {
        session.value = existingSession;
        await loadProfile(existingSession.user.id, existingSession.user.email);
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

  /** Refresh profile data */
  async function refreshProfile(): Promise<void> {
    if (userId.value) {
      await loadProfile(userId.value);
    }
  }

  /** Listen for auth state changes */
  function setupAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      session.value = newSession;

      if (event === "SIGNED_OUT") {
        profile.value = null;
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
    setupAuthListener
  };
});
