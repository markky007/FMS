<template>
  <div v-if="slip" class="q-gutter-y-md">
    <!-- Header Summary Card -->
    <q-card flat bordered class="bg-white">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="row items-center">
            <q-chip color="primary" text-color="white" class="text-weight-bold">
              {{ slip.slip_number }}
            </q-chip>
            <StatusChip :status="slip.status" class="q-ml-xs" />
          </div>

          <!-- Actions -->
          <div class="row q-gutter-xs">
            <q-btn
              color="primary"
              icon="print"
              label="พิมพ์ / Export PDF"
              unelevated
              @click="handlePrintSlip"
            />
            <q-btn
              v-if="slip.status === SlipStatus.DRAFT"
              color="positive"
              icon="send"
              label="ยืนยันส่งเอกสาร"
              unelevated
              :loading="isSubmitting"
              @click="handleSend"
            />
            <q-btn
              v-if="authStore.isAdmin && slip.status !== SlipStatus.VOIDED"
              outline
              color="negative"
              icon="block"
              label="ยกเลิกใบส่ง (Void)"
              @click="handleVoid"
            />
          </div>
        </div>

        <!-- Excel-like Header Info Grid -->
        <div class="q-pa-md bg-grey-1 rounded-borders border-grey">
          <div
            class="text-subtitle1 text-weight-bold text-center q-mb-sm text-primary"
          >
            KCST : COVER LIST OF DOCUMENT & ETC. DELIVERY
          </div>

          <div class="row q-col-gutter-md text-body2">
            <div class="col-12 col-sm-3">
              <span class="text-grey-7">From (ต้นทาง):</span>
              <div class="text-weight-bold">
                {{ slip.from_department?.code }} -
                {{ slip.from_department?.name }}
              </div>
            </div>
            <div class="col-12 col-sm-3">
              <span class="text-grey-7">To (ปลายทาง):</span>
              <div class="text-weight-bold">
                {{ slip.to_department?.code }} - {{ slip.to_department?.name }}
              </div>
            </div>
            <div class="col-12 col-sm-3">
              <span class="text-grey-7">Delivery by (ผู้จัดส่ง):</span>
              <div class="text-weight-bold">
                {{ slip.delivered_by_name || slip.creator?.full_name || "-" }}
              </div>
            </div>
            <div class="col-12 col-sm-3">
              <span class="text-grey-7">Date / Time (วันเวลาที่ส่ง):</span>
              <div class="text-weight-bold">
                {{ formatDate(slip.send_date) }} {{ slip.send_time || "" }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Items Section Card -->
    <q-card flat bordered class="bg-white">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">
          รายการเอกสารในใบส่ง ({{ items.length }} รายการ)
        </div>
        <ItemList :items="items" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import StatusChip from "@/shared/components/StatusChip.vue";
import ItemList from "./ItemList.vue";
import ExportDialog from "@/features/reports/components/ExportDialog.vue";
import { useAuthStore } from "@/stores/auth.store";
import { useDeliverySlip } from "../composables/useDeliverySlip";
import { SlipStatus } from "@/types/enums";
import type { DeliverySlip, DeliveryItem } from "@/types/models";

const props = defineProps<{
  slip: DeliverySlip;
  items: DeliveryItem[];
}>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const authStore = useAuthStore();
const { sendSlip, voidSlip, isSubmitting } = useDeliverySlip();
const $q = useQuasar();

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function handlePrintSlip() {
  $q.dialog({
    component: ExportDialog,
    componentProps: {
      slip: props.slip,
      items: props.items
    }
  });
}

async function handleSend() {
  const success = await sendSlip(props.slip.id);
  if (success) {
    emit("refresh");
  }
}

async function handleVoid() {
  const success = await voidSlip(props.slip.id);
  if (success) {
    emit("refresh");
  }
}
</script>

<style scoped>
.border-grey {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
