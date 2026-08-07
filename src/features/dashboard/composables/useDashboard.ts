/**
 * Composable for Dashboard Operations
 */

import { storeToRefs } from "pinia";
import { useDashboardStore } from "@/stores/dashboard.store";

export function useDashboard() {
  const dashboardStore = useDashboardStore();
  const { stats, departmentBreakdown, recentSlips, isLoading } =
    storeToRefs(dashboardStore);

  async function refreshDashboard(): Promise<void> {
    await dashboardStore.fetchDashboardData();
  }

  return {
    stats,
    departmentBreakdown,
    recentSlips,
    isLoading,
    refreshDashboard
  };
}
