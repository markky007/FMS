<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">ประวัติการรับเอกสาร</div>
        <div class="text-caption text-grey-7">
          รายการเอกสารที่คุณได้ทำการเซ็นรับแล้วพร้อมหลักฐานลายเซ็น
        </div>
      </div>
      <q-btn
        flat
        icon="refresh"
        label="รีเฟรช"
        color="primary"
        :loading="isLoading"
        @click="fetchReceivedHistory"
      />
    </div>

    <!-- Filter Bar -->
    <q-card flat bordered class="q-mb-md bg-white">
      <q-card-section class="row items-center q-col-gutter-sm">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="search"
            placeholder="ค้นหาชื่อเอกสาร หรือเลขที่ใบส่ง..."
            dense
            outlined
            clearable
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-card-section>
    </q-card>

    <!-- History Table -->
    <q-card flat bordered>
      <q-table
        :rows="filteredHistory"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        flat
        :pagination="{ rowsPerPage: 20 }"
      >
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

        <template #body-cell-received_at="props">
          <q-td :props="props">
            <span class="text-weight-medium">
              {{ formatDate(props.value) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-signature="props">
          <q-td :props="props" align="center">
            <q-btn
              v-if="props.row.signature"
              flat
              dense
              size="sm"
              color="primary"
              icon="draw"
              label="ดูลายเซ็น"
              @click="viewSignature(props.row.signature)"
            />
            <span v-else class="text-caption text-grey-5">-</span>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Signature View Lightbox -->
    <q-dialog v-model="showSigDialog">
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bold">หลักฐานลายเซ็นรับ</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="text-center q-pa-md">
          <div
            v-if="activeSigUrl"
            class="border-grey rounded-borders q-pa-sm bg-grey-1"
          >
            <q-img
              :src="activeSigUrl"
              style="max-height: 200px"
              fit="contain"
            />
          </div>
          <q-spinner v-else color="primary" size="40px" />
          <div v-if="activeSig" class="text-caption text-grey-7 q-mt-sm">
            ผู้เซ็น: {{ activeSig.signer_name }} ({{
              formatDate(activeSig.signed_at)
            }})
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useReceiving } from "../composables/useReceiving";
import { useStorage } from "@/shared/composables/useStorage";
import { APP_CONFIG } from "@/app.config";
import type { DeliveryItem, Signature } from "@/types/models";

const { receivedHistory, isLoading, fetchReceivedHistory } = useReceiving();
const { getSignedUrl } = useStorage();

const search = ref("");
const showSigDialog = ref(false);
const activeSigUrl = ref<string | null>(null);
const activeSig = ref<Signature | null>(null);

const filteredHistory = computed(() => {
  if (!search.value.trim()) return receivedHistory.value;
  const q = search.value.toLowerCase().trim();
  return receivedHistory.value.filter(
    item =>
      item.document_description.toLowerCase().includes(q) ||
      (item.delivery_slip?.slip_number || "").toLowerCase().includes(q) ||
      item.sender_name.toLowerCase().includes(q)
  );
});

const columns = [
  {
    name: "document_description",
    label: "รายการเอกสาร",
    field: "document_description",
    sortable: true,
    align: "left" as const
  },
  {
    name: "slip_number",
    label: "เลขที่ใบส่ง",
    field: (r: DeliveryItem) => r.delivery_slip?.slip_number || "-",
    sortable: true,
    align: "left" as const
  },
  {
    name: "sender_name",
    label: "ผู้ส่ง",
    field: "sender_name",
    sortable: true,
    align: "left" as const
  },
  {
    name: "receiver_name",
    label: "ผู้รับ",
    field: "receiver_name",
    sortable: true,
    align: "left" as const
  },
  {
    name: "quantity",
    label: "จำนวน",
    field: "quantity",
    sortable: true,
    align: "center" as const
  },
  {
    name: "received_at",
    label: "วันเวลาที่รับ",
    field: "received_at",
    sortable: true,
    align: "center" as const
  },
  {
    name: "signature",
    label: "ลายเซ็น",
    field: "signature",
    align: "center" as const
  }
];

function formatDate(dt?: string | null): string {
  if (!dt) return "";
  return new Date(dt).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

async function viewSignature(sig: Signature) {
  activeSig.value = sig;
  activeSigUrl.value = null;
  showSigDialog.value = true;

  const url = await getSignedUrl(
    APP_CONFIG.STORAGE_BUCKETS.SIGNATURES,
    sig.storage_path
  );
  activeSigUrl.value = url;
}

onMounted(async () => {
  await fetchReceivedHistory();
});
</script>

<style scoped>
.border-grey {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
