/**
 * Notification Pinia Store
 * Manages pending received items badge counts and realtime alerts
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/boot/supabase";
import { useAuthStore } from "@/stores/auth.store";

export const useNotificationStore = defineStore("notification", () => {
  const pendingCount = ref(0);
  let channel: RealtimeChannel | null = null;

  async function fetchPendingCount(): Promise<void> {
    const authStore = useAuthStore();
    if (!authStore.userId) return;

    // Count delivery items where receiver is current user and not yet received
    const { count, error } = await supabase
      .from("delivery_items")
      .select("*", { count: "exact", head: true })
      .eq("is_received", false)
      .or(`receiver_user_id.eq.${authStore.userId}`);

    if (!error && count !== null) {
      pendingCount.value = count;
    }
  }

  function subscribeToPending(): void {
    const authStore = useAuthStore();
    if (!authStore.userId || channel) return;

    channel = supabase
      .channel("pending-items-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_items",
        },
        () => {
          void fetchPendingCount();
        },
      )
      .subscribe();
  }

  function unsubscribe(): void {
    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
  }

  return {
    pendingCount,
    fetchPendingCount,
    subscribeToPending,
    unsubscribe,
  };
});
