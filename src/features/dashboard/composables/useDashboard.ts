/**
 * Composable for Dashboard Operations
 */

import { useDashboardStore } from "@/stores/dashboard.store";

export function useDashboard() {
  const dashboardStore = useDashboardStore();

  async function refreshDashboard(): Promise<void> {
    await dashboardStore.fetchDashboardData();
  }

  return {
    stats: dashboardStore.stats,
    departmentBreakdown: dashboardStore.departmentBreakdown,
    recentSlips: dashboardStore.recentSlips,
    isLoading: dashboardStore.isLoading,
    refreshDashboard,
  };
}
