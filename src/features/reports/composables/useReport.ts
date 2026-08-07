/**
 * Composable for Reports & PDF Export
 * Handles summary queries, stats aggregation, and PDF export triggers
 */

import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import { useNotification } from "@/shared/composables/useNotification";
import { getFirstDayOfMonthString, getTodayString } from "@/shared/utils/date";
import type { DeliverySlip, SlipFilters } from "@/types/models";
import { SlipStatus } from "@/types/enums";

export interface ReportSummaryStats {
  total_slips: number;
  fully_received: number;
  partially_received: number;
  pending: number;
  voided: number;
}

export function useReport() {
  const notify = useNotification();

  const slips = ref<DeliverySlip[]>([]);
  const isLoading = ref(false);

  const stats = ref<ReportSummaryStats>({
    total_slips: 0,
    fully_received: 0,
    partially_received: 0,
    pending: 0,
    voided: 0,
  });

  const reportFilters = ref<SlipFilters>({
    date_from: getFirstDayOfMonthString(),
    date_to: getTodayString(),
  });

  /** Fetch summary report data based on filters */
  async function fetchReportData(customFilters?: SlipFilters): Promise<void> {
    isLoading.value = true;
    try {
      const activeFilters = customFilters || reportFilters.value;

      let query = supabase
        .from("delivery_slips")
        .select(
          `
          *,
          from_department:departments!from_department_id(*),
          to_department:departments!to_department_id(*),
          creator:profiles!created_by(id, full_name, email),
          items:delivery_items(id, is_received)
        `,
        )
        .order("send_date", { ascending: false });

      if (activeFilters.date_from) {
        query = query.gte("send_date", activeFilters.date_from);
      }
      if (activeFilters.date_to) {
        query = query.lte("send_date", activeFilters.date_to);
      }
      if (activeFilters.status) {
        query = query.eq("status", activeFilters.status);
      }
      if (activeFilters.from_department_id) {
        query = query.eq("from_department_id", activeFilters.from_department_id);
      }
      if (activeFilters.to_department_id) {
        query = query.eq("to_department_id", activeFilters.to_department_id);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const list = (data || []).map((slip) => ({
        ...slip,
        item_count: slip.items?.length || 0,
      })) as DeliverySlip[];

      slips.value = list;

      // Calculate summary stats
      stats.value = {
        total_slips: list.length,
        fully_received: list.filter((s) => s.status === SlipStatus.FULLY_RECEIVED).length,
        partially_received: list.filter((s) => s.status === SlipStatus.PARTIALLY_RECEIVED).length,
        pending: list.filter((s) => s.status === SlipStatus.SENT || s.status === SlipStatus.DRAFT).length,
        voided: list.filter((s) => s.status === SlipStatus.VOIDED).length,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลรายงานได้";
      notify.error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  /** Trigger browser print for printable document view */
  function printDocument(): void {
    window.print();
  }

  return {
    slips,
    isLoading,
    stats,
    reportFilters,
    fetchReportData,
    printDocument,
  };
}
