/**
 * Responsive Layout Helper Composable
 * Wraps $q.screen for clean breakpoint checks in Vue components
 */

import { useQuasar } from "quasar";
import { computed } from "vue";

export function useResponsive() {
  const $q = useQuasar();

  /** Primary Breakpoint: true if width < 1024px (Mobile Layout) */
  const isMobile = computed(() => $q.screen.lt.md);

  /** Primary Breakpoint: true if width >= 1024px (Desktop Layout) */
  const isDesktop = computed(() => $q.screen.gt.sm);

  return {
    isMobile,
    isDesktop,
    screen: $q.screen
  };
}
