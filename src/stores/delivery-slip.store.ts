/**
 * Delivery Slip Pinia Store
 * Manages delivery slips list, current active slip detail, items, and filters
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/boot/supabase";
import type { DeliverySlip, DeliveryItem, SlipFilters } from "@/types/models";
import { SlipStatus } from "@/types/enums";
import { useAuthStore } from "./auth.store";

export const useDeliverySlipStore = defineStore("delivery-slip", () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const mySlips = ref<DeliverySlip[]>([]);
  const currentSlip = ref<DeliverySlip | null>(null);
  const currentItems = ref<DeliveryItem[]>([]);
  const isLoading = ref(false);
  const totalCount = ref(0);

  const filters = ref<SlipFilters>({});

  // ─── Actions ────────────────────────────────────────────────────────────────

  /** Fetch slips created by current user or for user's department */
  async function fetchMySlips(customFilters?: SlipFilters): Promise<void> {
    const authStore = useAuthStore();
    if (!authStore.userId) return;

    isLoading.value = true;
    try {
      const activeFilters = customFilters || filters.value;

      let query = supabase
        .from("delivery_slips")
        .select(
          `
          *,
          from_department:departments!from_department_id(*),
          to_department:departments!to_department_id(*),
          creator:profiles!created_by(id, full_name, email, department_id),
          items:delivery_items(id, is_received)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false });

      // If staff, filter created by user or targeting user's department
      if (authStore.isStaff) {
        if (authStore.departmentId) {
          query = query.or(
            `created_by.eq.${authStore.userId},to_department_id.eq.${authStore.departmentId}`,
          );
        } else {
          query = query.eq("created_by", authStore.userId);
        }
      }

      // Filter applications
      if (activeFilters.status) {
        query = query.eq("status", activeFilters.status);
      }
      if (activeFilters.from_department_id) {
        query = query.eq("from_department_id", activeFilters.from_department_id);
      }
      if (activeFilters.to_department_id) {
        query = query.eq("to_department_id", activeFilters.to_department_id);
      }
      if (activeFilters.date_from) {
        query = query.gte("send_date", activeFilters.date_from);
      }
      if (activeFilters.date_to) {
        query = query.lte("send_date", activeFilters.date_to);
      }

      const { data, count, error } = await query;
      if (error) throw new Error(error.message);

      mySlips.value = (data || []).map((slip) => ({
        ...slip,
        item_count: slip.items?.length || 0,
      })) as DeliverySlip[];

      totalCount.value = count || 0;
    } finally {
      isLoading.value = false;
    }
  }

  /** Fetch full slip detail with all items, attachments, signatures */
  async function fetchSlipDetail(id: string): Promise<DeliverySlip | null> {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from("delivery_slips")
        .select(
          `
          *,
          from_department:departments!from_department_id(*),
          to_department:departments!to_department_id(*),
          creator:profiles!created_by(id, full_name, email, department_id),
          items:delivery_items(
            *,
            attachments:item_attachments(*),
            signature:signatures(*)
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);

      currentSlip.value = data as DeliverySlip;
      currentItems.value = (data.items || []).sort(
        (a: DeliveryItem, b: DeliveryItem) => a.item_number - b.item_number,
      ) as DeliveryItem[];

      return currentSlip.value;
    } finally {
      isLoading.value = false;
    }
  }

  /** Clear current slip state */
  function clearCurrent(): void {
    currentSlip.value = null;
    currentItems.value = [];
  }

  return {
    mySlips,
    currentSlip,
    currentItems,
    isLoading,
    totalCount,
    filters,
    fetchMySlips,
    fetchSlipDetail,
    clearCurrent,
  };
});
