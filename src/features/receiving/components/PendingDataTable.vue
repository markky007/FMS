<template>
  <q-table
    :rows="items"
    :columns="columns"
    row-key="id"
    :loading="loading"
    flat
    bordered
    :pagination="{ rowsPerPage: 20 }"
    :selection="selectable ? 'multiple' : 'none'"
    v-model:selected="selectedRows"
    @update:selected="onSelectionChanged"
  >
    <template #top-left v-if="selectable && selectedRows.length > 0">
      <q-btn
        color="positive"
        icon="gesture"
        :label="`เซ็นรับที่เลือก (${selectedRows.length} รายการ)`"
        unelevated
        @click="$emit('batch-sign', [...selectedRows])"
      />
    </template>

    <template #body-cell-document_description="props">
      <q-td :props="props">
        <span class="text-weight-bold text-dark">
          {{ props.value }}
        </span>
      </q-td>
    </template>

    <template #body-cell-slip_number="props">
      <q-td :props="props">
        <span class="text-primary text-weight-medium">
          {{ props.row.delivery_slip?.slip_number || "-" }}
        </span>
      </q-td>
    </template>

    <template #body-cell-route="props">
      <q-td :props="props">
        <span class="text-weight-medium">
          {{ props.row.delivery_slip?.from_department?.code }}
        </span>
        <q-icon name="arrow_forward" size="14px" color="grey-6" class="q-mx-xs" />
        <span class="text-weight-medium">
          {{ props.row.delivery_slip?.to_department?.code }}
        </span>
      </q-td>
    </template>

    <template #body-cell-attachments="props">
      <q-td :props="props" align="center">
        <AttachmentViewer :attachments="props.row.attachments" />
      </q-td>
    </template>

    <template #body-cell-actions="props">
      <q-td :props="props" align="right">
        <q-btn
          color="positive"
          icon="gesture"
          label="เซ็นรับ"
          unelevated
          size="sm"
          @click="$emit('sign', props.row)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AttachmentViewer from "@/shared/components/AttachmentViewer.vue";
import type { DeliveryItem } from "@/types/models";

withDefaults(
  defineProps<{
    items: DeliveryItem[];
    loading?: boolean;
    selectable?: boolean;
  }>(),
  {
    loading: false,
    selectable: true,
  },
);

const emit = defineEmits<{
  (e: "sign", item: DeliveryItem): void;
  (e: "batch-sign", items: DeliveryItem[]): void;
}>();

const selectedRows = ref<DeliveryItem[]>([]);

function onSelectionChanged(val: readonly DeliveryItem[]) {
  selectedRows.value = [...val];
}

const columns = [
  { name: "document_description", label: "รายการเอกสาร (document description)", field: "document_description", sortable: true, align: "left" as const },
  { name: "slip_number", label: "เลขที่ใบส่ง", field: (r: DeliveryItem) => r.delivery_slip?.slip_number || "-", sortable: true, align: "left" as const },
  { name: "route", label: "เส้นทาง (จาก → ถึง)", field: "route", align: "left" as const },
  { name: "receiver_name", label: "ผู้รับ", field: "receiver_name", sortable: true, align: "left" as const },
  { name: "sender_name", label: "ผู้ส่ง", field: "sender_name", sortable: true, align: "left" as const },
  { name: "quantity", label: "จำนวน", field: "quantity", sortable: true, align: "center" as const },
  { name: "attachments", label: "รูปแนบ", field: "attachments", align: "center" as const },
  { name: "actions", label: "เซ็นรับ", field: "actions", align: "right" as const },
];
</script>
