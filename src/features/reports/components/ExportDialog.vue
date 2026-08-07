<template>
  <q-dialog
    ref="dialogRef"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @hide="onDialogHide"
  >
    <q-card class="column bg-grey-3">
      <!-- Toolbar Header (Hidden when printing) -->
      <q-card-section class="bg-primary text-white row items-center justify-between no-print q-pa-sm">
        <div class="row items-center">
          <q-icon name="picture_as_pdf" size="24px" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold">
            พิมพ์ / Export PDF ใบส่งเอกสาร (Cover List)
          </div>
        </div>

        <div class="row q-gutter-sm items-center">
          <q-btn
            color="positive"
            icon="print"
            label="พิมพ์เอกสาร / บันทึก PDF"
            unelevated
            @click="handlePrint"
          />
          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </div>
      </q-card-section>

      <!-- Printable Slip Preview Area -->
      <q-card-section class="col overflow-auto flex flex-center q-pa-md">
        <div class="printable-container shadow-6 rounded-borders bg-white full-width">
          <PrintableSlip :slip="slip" :items="items" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import PrintableSlip, { type ItemWithSig } from "@/features/delivery/components/PrintableSlip.vue";
import type { DeliverySlip } from "@/types/models";

defineProps<{
  slip?: DeliverySlip | null;
  items?: ItemWithSig[];
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide } = useDialogPluginComponent();

function handlePrint() {
  window.print();
}
</script>

<style scoped>
.printable-container {
  max-width: 900px;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
