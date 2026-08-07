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

  // Navigation guard: redirect to login if not authenticated (Vue Router 5 return value syntax)
  router.beforeEach(to => {
    const requiresAuth = to.matched.some(
      record => record.meta.requiresAuth !== false
    );
    const allowedRoles = to.meta.roles as string[] | undefined;

    // Allow login page without auth
    if (to.path === "/login") {
      if (authStore.isAuthenticated) {
        return "/home";
      }
      return true;
    }

    // Check authentication
    if (requiresAuth && !authStore.isAuthenticated) {
      return "/login";
    }

    // Check role-based access
    if (
      allowedRoles &&
      authStore.role &&
      !allowedRoles.includes(authStore.role)
    ) {
      return "/home";
    }

    // Check if user account is active
    if (authStore.profile && !authStore.profile.is_active) {
      authStore.logout();
      return "/login";
    }

    return true;
  });
});
