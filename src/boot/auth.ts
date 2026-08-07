/**
 * Auth boot file
 * Restores session on app startup and sets up auth listener
 */

import { defineBoot } from "#q-app";
import { useAuthStore } from "@/stores/auth.store";

export default defineBoot(async ({ router }) => {
  const authStore = useAuthStore();

  // Restore session from persisted storage
  await authStore.restoreSession();

  // Setup auth state change listener
  authStore.setupAuthListener();

  // Navigation guard: redirect to login if not authenticated
  router.beforeEach((to, _from, next) => {
    const requiresAuth = to.matched.some(
      (record) => record.meta.requiresAuth !== false,
    );
    const allowedRoles = to.meta.roles as string[] | undefined;

    // Allow login page without auth
    if (to.path === "/login") {
      if (authStore.isAuthenticated) {
        next("/home");
        return;
      }
      next();
      return;
    }

    // Check authentication
    if (requiresAuth && !authStore.isAuthenticated) {
      next("/login");
      return;
    }

    // Check role-based access
    if (
      allowedRoles &&
      authStore.role &&
      !allowedRoles.includes(authStore.role)
    ) {
      next("/home");
      return;
    }

    // Check if user account is active
    if (authStore.profile && !authStore.profile.is_active) {
      authStore.logout();
      next("/login");
      return;
    }

    next();
  });
});
