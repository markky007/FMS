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

    // Get slips sent to current user's department
    let incomingSlipIds: string[] = [];
    if (authStore.departmentId) {
      const { data } = await supabase
        .from("delivery_slips")
        .select("id")
        .eq("to_department_id", authStore.departmentId)
        .in("status", ["sent", "partially_received"]);
      incomingSlipIds = (data || []).map((s) => s.id);
    }

    let query = supabase
      .from("delivery_items")
      .select("*", { count: "exact", head: true })
      .eq("is_received", false);

    if (incomingSlipIds.length > 0) {
      query = query.or(
        `receiver_user_id.eq.${authStore.userId},delivery_slip_id.in.(${incomingSlipIds.join(",")})`,
      );
    } else {
      query = query.eq("receiver_user_id", authStore.userId);
    }

    const { count, error } = await query;
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
