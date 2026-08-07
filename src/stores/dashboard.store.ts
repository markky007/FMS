/**
 * Dashboard Pinia Store
 * Manages stats aggregation, recent activities, and department breakdowns
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import { getTodayString } from "@/shared/utils/date";
import { SlipStatus } from "@/types/enums";
import type { DashboardStats, DepartmentBreakdown, DeliverySlip } from "@/types/models";

export const useDashboardStore = defineStore("dashboard", () => {
  const stats = ref<DashboardStats>({
    today_sent: 0,
    today_received: 0,
    pending_count: 0,
    month_total: 0,
  });

  const departmentBreakdown = ref<DepartmentBreakdown[]>([]);
  const recentSlips = ref<DeliverySlip[]>([]);
  const isLoading = ref(false);

  async function fetchDashboardData(): Promise<void> {
    isLoading.value = true;
    try {
      const today = getTodayString();
      const firstDayOfMonth = `${today.substring(0, 7)}-01`;

      // 1. Today's sent count
      const { count: todaySentCount } = await supabase
        .from("delivery_slips")
        .select("*", { count: "exact", head: true })
        .eq("send_date", today);

      // 2. Today's received count
      const { count: todayReceivedCount } = await supabase
        .from("delivery_items")
        .select("*", { count: "exact", head: true })
        .eq("is_received", true)
        .gte("received_at", `${today}T00:00:00.000Z`);

      // 3. Pending items count
      const { count: pendingCount } = await supabase
        .from("delivery_items")
        .select("*", { count: "exact", head: true })
        .eq("is_received", false);

      // 4. Month total slips count
      const { count: monthTotalCount } = await supabase
        .from("delivery_slips")
        .select("*", { count: "exact", head: true })
        .gte("send_date", firstDayOfMonth);

      stats.value = {
        today_sent: todaySentCount || 0,
        today_received: todayReceivedCount || 0,
        pending_count: pendingCount || 0,
        month_total: monthTotalCount || 0,
      };

      // 5. Recent 5 slips
      const { data: recentData } = await supabase
        .from("delivery_slips")
        .select(
          `
          *,
          from_department:departments!from_department_id(*),
          to_department:departments!to_department_id(*),
          items:delivery_items(id, is_received)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5);

      recentSlips.value = (recentData || []).map((s) => ({
        ...s,
        item_count: s.items?.length || 0,
      })) as DeliverySlip[];

      // 6. Department breakdown
      const { data: deptData } = await supabase
        .from("delivery_slips")
        .select("from_department:departments!from_department_id(id, code, name)");

      if (deptData) {
        const counts: Record<string, { code: string; name: string; count: number }> = {};

        for (const raw of deptData as unknown as { from_department: { id: string; code: string; name: string } | null }[]) {
          const dept = raw.from_department;
          if (dept) {
            if (!counts[dept.id]) {
              counts[dept.id] = { code: dept.code, name: dept.name, count: 0 };
            }
            const record = counts[dept.id];
            if (record) {
              record.count += 1;
            }
          }
        }

        departmentBreakdown.value = Object.entries(counts).map(([id, val]) => ({
          department_id: id,
          department_code: val.code,
          department_name: val.name,
          count: val.count,
        }));
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    stats,
    departmentBreakdown,
    recentSlips,
    isLoading,
    fetchDashboardData,
  };
});
