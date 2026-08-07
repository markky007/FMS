<template>
  <div class="q-gutter-y-sm">
    <q-card
      v-for="slip in slips"
      :key="slip.id"
      clickable
      v-ripple
      flat
      bordered
      class="bg-white hover-shadow"
      @click="$emit('select', slip)"
    >
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-subtitle1 text-weight-bold text-primary">
            {{ slip.slip_number }}
          </div>
          <StatusChip :status="slip.status" dense />
        </div>

        <div class="text-body2 text-weight-medium text-grey-9 q-mb-xs">
          {{ slip.from_department?.code }}
          <q-icon
            name="arrow_forward"
            size="16px"
            color="grey-6"
            class="q-mx-xs"
          />
          {{ slip.to_department?.code }}
        </div>

        <div class="row items-center justify-between text-caption text-grey-7">
          <div
            >ผู้จัดส่ง:
            {{ slip.delivered_by_name || slip.creator?.full_name || "-" }}</div
          >
          <div>วันที่: {{ formatDate(slip.send_date) }}</div>
        </div>

        <div
          class="row items-center justify-between text-caption text-grey-6 q-mt-xs pt-xs border-top"
        >
          <div>จำนวนรายการ: {{ slip.item_count || 0 }} รายการ</div>
          <q-icon name="chevron_right" size="20px" color="grey-6" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import StatusChip from "@/shared/components/StatusChip.vue";
import type { DeliverySlip } from "@/types/models";

defineProps<{
  slips: DeliverySlip[];
}>();

defineEmits<{
  (e: "select", slip: DeliverySlip): void;
}>();

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit"
  });
}
</script>

<style scoped>
.hover-shadow {
  transition: box-shadow 0.2s ease;
}
.hover-shadow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.border-top {
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
</style>
