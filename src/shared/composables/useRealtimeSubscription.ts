/**
 * Realtime Subscription Composable
 * Listens for live database changes on delivery_slips, delivery_items, and signatures
 */

import { onMounted, onUnmounted } from "vue";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/boot/supabase";
import { useNotificationStore } from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";

export interface RealtimeOptions {
  onSlipChange?: () => void;
  onItemChange?: () => void;
}

export function useRealtimeSubscription(options: RealtimeOptions = {}) {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  let channel: RealtimeChannel | null = null;

  function subscribe(): void {
    if (!authStore.userId || channel) return;

    channel = supabase
      .channel("app-realtime-changes")
      // Listen to delivery_slips changes (new slip created, slip status updated to fully_received/voided)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "delivery_slips" },
        () => {
          options.onSlipChange?.();
        }
      )
      // Listen to delivery_items changes (item added, item signed)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "delivery_items" },
        () => {
          options.onItemChange?.();
          options.onSlipChange?.();
          void notificationStore.fetchPendingCount();
        }
      )
      // Listen to signatures changes (new signature uploaded)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "signatures" },
        () => {
          options.onItemChange?.();
          options.onSlipChange?.();
        }
      )
      .subscribe();
  }

  function unsubscribe(): void {
    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
  }

  onMounted(() => {
    subscribe();
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return {
    subscribe,
    unsubscribe
  };
}
