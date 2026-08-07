<template>
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold row items-center">
          รายการรอรับเอกสาร
          <q-chip
            v-if="pendingItems.length > 0"
            color="negative"
            text-color="white"
            dense
            class="q-ml-sm"
          >
            {{ pendingItems.length }}
          </q-chip>
        </div>
        <div class="text-caption text-grey-7">
          รายการเอกสารที่ส่งมาถึงคุณหรือแผนกของคุณเพื่อรอการเซ็นรับ
        </div>
      </div>
      <q-btn
        flat
        icon="refresh"
        label="รีเฟรช"
        color="primary"
        :loading="isLoading"
        @click="fetchPendingItems"
      />
    </div>

    <!-- Content List -->
    <div v-if="pendingItems.length > 0">
      <PendingListView
        :items="pendingItems"
        :loading="isLoading"
        @sign="openSignSingle"
        @batch-sign="openSignBatch"
      />
    </div>

    <q-card v-else-if="!isLoading" flat bordered class="bg-white">
      <q-card-section>
        <EmptyState
          title="ไม่มีเอกสารค้างรับ"
          description="ขณะนี้ไม่มีรายการเอกสารที่รอการเซ็นรับในระบบ"
          icon="check_circle_outline"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth.store";
import { useReceiving } from "../composables/useReceiving";
import PendingListView from "../components/PendingListView.vue";
import SignatureDialog from "../components/SignatureDialog.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import type { DeliveryItem } from "@/types/models";

const $q = useQuasar();
const authStore = useAuthStore();
const { pendingItems, isLoading, fetchPendingItems, signItem, batchSignItems } =
  useReceiving();

function openSignSingle(item: DeliveryItem) {
  $q.dialog({
    component: SignatureDialog,
    componentProps: {
      items: [item],
      signerName: authStore.fullName || item.receiver_name,
    },
  }).onOk(async (res: { blob: Blob; signerName: string }) => {
    await signItem(item, res.blob, res.signerName);
  });
}

function openSignBatch(itemsToSign: DeliveryItem[]) {
  $q.dialog({
    component: SignatureDialog,
    componentProps: {
      items: itemsToSign,
      signerName: authStore.fullName || "ผู้รับเอกสาร",
    },
  }).onOk(async (res: { blob: Blob; signerName: string }) => {
    await batchSignItems(itemsToSign, res.blob, res.signerName);
  });
}

onMounted(async () => {
  await fetchPendingItems();
});
</script>
