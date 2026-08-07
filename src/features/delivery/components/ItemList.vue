<template>
  <div>
    <!-- Desktop Table View -->
    <q-markup-table
      v-if="$q.screen.gt.sm"
      flat
      bordered
      class="rounded-borders"
    >
      <thead>
        <tr class="bg-grey-2 text-grey-8">
          <th class="text-center" style="width: 50px">Item No.</th>
          <th class="text-left">Receiver's name (ผู้รับ)</th>
          <th class="text-left">Sender's name (ผู้ส่ง)</th>
          <th class="text-left">QTY.</th>
          <th class="text-left">Sign for receive / เอกสารคืออะไร</th>
          <th class="text-center">รูปแนบ</th>
          <th v-if="editable" class="text-right">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id || item.item_number">
          <td class="text-center text-weight-bold">{{ item.item_number }}</td>
          <td>{{ item.receiver_name }}</td>
          <td>{{ item.sender_name }}</td>
          <td>
            <q-badge
              color="blue-2"
              text-color="primary"
              class="text-weight-bold"
            >
              {{ item.quantity }}
            </q-badge>
          </td>
          <td>
            <div class="text-weight-medium">{{
              item.document_description
            }}</div>
            <div
              v-if="item.is_received"
              class="text-caption text-positive row items-center q-mt-xs"
            >
              <q-icon name="check_circle" size="14px" class="q-mr-xs" />
              รับแล้วเมื่อ {{ formatDate(item.received_at) }}
            </div>
            <div v-else class="text-caption text-orange">
              (เว้นว่างไว้ให้คนรับเซ็น)
            </div>
          </td>
          <td class="text-center">
            <AttachmentViewer :attachments="item.attachments" />
          </td>
          <td v-if="editable" class="text-right">
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="$emit('delete-item', item)"
            >
              <q-tooltip>ลบรายการ</q-tooltip>
            </q-btn>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td
            :colspan="editable ? 7 : 6"
            class="text-center text-grey-5 q-pa-md"
          >
            ยังไม่มีรายการเอกสารในใบส่งนี้
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Mobile Card List View -->
    <div v-else class="q-gutter-y-sm">
      <q-card
        v-for="item in items"
        :key="item.id || item.item_number"
        flat
        bordered
        class="bg-grey-1"
      >
        <q-card-section class="q-pa-sm">
          <div class="row items-center justify-between q-mb-xs">
            <div class="row items-center">
              <q-avatar
                size="24px"
                color="primary"
                text-color="white"
                class="text-caption text-weight-bold q-mr-xs"
              >
                {{ item.item_number }}
              </q-avatar>
              <span class="text-weight-bold text-subtitle2">
                {{ item.document_description }}
              </span>
            </div>
            <q-btn
              v-if="editable"
              flat
              round
              dense
              color="negative"
              icon="delete"
              size="sm"
              @click="$emit('delete-item', item)"
            />
          </div>

          <div class="text-caption text-grey-8 row q-col-gutter-xs">
            <div class="col-6">
              <span class="text-grey-6">ผู้รับ:</span> {{ item.receiver_name }}
            </div>
            <div class="col-6">
              <span class="text-grey-6">ผู้ส่ง:</span> {{ item.sender_name }}
            </div>
            <div class="col-6">
              <span class="text-grey-6">จำนวน:</span> {{ item.quantity }}
            </div>
            <div class="col-6 row items-center">
              <span class="text-grey-6 q-mr-xs">สถานะ:</span>
              <q-badge :color="item.is_received ? 'positive' : 'orange'" dense>
                {{ item.is_received ? "รับแล้ว" : "ยังไม่รับ" }}
              </q-badge>
            </div>
          </div>

          <div
            v-if="item.attachments && item.attachments.length > 0"
            class="q-mt-xs"
          >
            <AttachmentViewer :attachments="item.attachments" />
          </div>
        </q-card-section>
      </q-card>

      <div v-if="items.length === 0" class="text-center text-grey-5 q-pa-md">
        ยังไม่มีรายการเอกสาร
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AttachmentViewer from "@/shared/components/AttachmentViewer.vue";
import type { DeliveryItem } from "@/types/models";

withDefaults(
  defineProps<{
    items: DeliveryItem[];
    editable?: boolean;
  }>(),
  {
    editable: false
  }
);

defineEmits<{
  (e: "delete-item", item: DeliveryItem): void;
}>();

function formatDate(dt?: string | null): string {
  if (!dt) return "";
  return new Date(dt).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short"
  });
}
</script>
