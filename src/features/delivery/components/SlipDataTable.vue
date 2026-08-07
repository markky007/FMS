<template>
  <q-table
    :rows="slips"
    :columns="columns"
    row-key="id"
    :loading="loading"
    flat
    bordered
    :pagination="{ rowsPerPage: 20 }"
    @row-click="onRowClick"
  >
    <template #body-cell-slip_number="props">
      <q-td :props="props">
        <span class="text-weight-bold text-primary cursor-pointer">
          {{ props.value }}
        </span>
      </q-td>
    </template>

    <template #body-cell-route="props">
      <q-td :props="props">
        <span class="text-weight-medium">
          {{ props.row.from_department?.code }}
        </span>
        <q-icon
          name="arrow_forward"
          size="14px"
          color="grey-6"
          class="q-mx-xs"
        />
        <span class="text-weight-medium">
          {{ props.row.to_department?.code }}
        </span>
      </q-td>
    </template>

    <template #body-cell-status="props">
      <q-td :props="props">
        <StatusChip :status="props.value" dense />
      </q-td>
    </template>

    <template #body-cell-actions="props">
      <q-td :props="props" align="right">
        <q-btn
          flat
          round
          dense
          icon="visibility"
          color="primary"
          @click.stop="$emit('select', props.row)"
        >
          <q-tooltip>ดูรายละเอียด</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import StatusChip from "@/shared/components/StatusChip.vue";
import type { DeliverySlip } from "@/types/models";

defineProps<{
  slips: DeliverySlip[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", slip: DeliverySlip): void;
}>();

function onRowClick(_evt: Event, row: DeliverySlip) {
  emit("select", row);
}

const columns = [
  {
    name: "slip_number",
    label: "เลขที่ใบส่ง",
    field: "slip_number",
    sortable: true,
    align: "left" as const
  },
  {
    name: "route",
    label: "เส้นทาง (จาก → ถึง)",
    field: "route",
    align: "left" as const
  },
  {
    name: "delivered_by",
    label: "ผู้จัดส่ง (Delivery by)",
    field: (r: DeliverySlip) =>
      r.delivered_by_name || r.creator?.full_name || "-",
    sortable: true,
    align: "left" as const
  },
  {
    name: "send_date",
    label: "วันที่ส่ง",
    field: "send_date",
    sortable: true,
    align: "center" as const
  },
  {
    name: "item_count",
    label: "จำนวนรายการ",
    field: (r: DeliverySlip) => r.item_count || 0,
    sortable: true,
    align: "center" as const
  },
  {
    name: "status",
    label: "สถานะ",
    field: "status",
    sortable: true,
    align: "center" as const
  },
  {
    name: "actions",
    label: "จัดการ",
    field: "actions",
    align: "right" as const
  }
];
</script>
