<template>
  <div class="q-gutter-y-sm">
    <q-card
      v-for="item in items"
      :key="item.id"
      flat
      bordered
      class="bg-white hover-border-primary"
    >
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-subtitle1 text-weight-bold text-primary">
            {{ item.document_description }}
          </div>
          <q-badge color="blue-2" text-color="primary" class="text-weight-bold">
            จำนวน {{ item.quantity }}
          </q-badge>
        </div>

        <div v-if="item.delivery_slip" class="text-caption text-grey-8 q-mb-xs">
          <span class="text-weight-medium">เลขที่ใบส่ง:</span> {{ item.delivery_slip.slip_number }}
          <span class="q-ml-sm text-grey-6">
            ({{ item.delivery_slip.from_department?.code }} → {{ item.delivery_slip.to_department?.code }})
          </span>
        </div>

        <div class="row justify-between items-center text-caption text-grey-7 q-mb-sm">
          <div>ผู้ส่ง: {{ item.sender_name }}</div>
          <div>ผู้รับ: {{ item.receiver_name }}</div>
        </div>

        <div v-if="item.attachments && item.attachments.length > 0" class="q-mb-sm">
          <AttachmentViewer :attachments="item.attachments" />
        </div>

        <div class="row justify-end border-top pt-xs">
          <q-btn
            color="positive"
            icon="gesture"
            label="เซ็นรับเอกสาร"
            unelevated
            size="sm"
            @click="$emit('sign', item)"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import AttachmentViewer from "@/shared/components/AttachmentViewer.vue";
import type { DeliveryItem } from "@/types/models";

defineProps<{
  items: DeliveryItem[];
}>();

defineEmits<{
  (e: "sign", item: DeliveryItem): void;
}>();
</script>

<style scoped>
.hover-border-primary:hover {
  border-color: #1976d2;
}
.border-top {
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
.pt-xs {
  padding-top: 8px;
}
</style>
