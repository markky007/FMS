<template>
  <q-dialog
    ref="dialogRef"
    :fullscreen="$q.screen.lt.md"
    persistent
    @hide="onDialogHide"
  >
    <q-card style="min-width: 380px; max-width: 600px">
      <!-- Header -->
      <q-card-section class="bg-primary text-white row items-center justify-between q-pa-md">
        <div class="row items-center">
          <q-icon name="gesture" size="24px" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold">
            เซ็นรับเอกสาร {{ isBatch ? `(${items.length} รายการ)` : '' }}
          </div>
        </div>
        <q-btn icon="close" flat round dense color="white" v-close-popup />
      </q-card-section>

      <!-- Content -->
      <q-card-section class="q-pa-md">
        <!-- Target Document Info -->
        <div class="bg-blue-1 border-blue rounded-borders q-pa-sm q-mb-md">
          <template v-if="!isBatch && singleItem">
            <div class="text-subtitle2 text-weight-bold text-primary">
              {{ singleItem.document_description }}
            </div>
            <div class="text-caption text-grey-8 row q-col-gutter-xs q-mt-xs">
              <div class="col-6">ผู้ส่ง: {{ singleItem.sender_name }}</div>
              <div class="col-6">จำนวน: {{ singleItem.quantity }}</div>
              <div class="col-12" v-if="singleItem.delivery_slip">
                เลขที่ใบส่ง: {{ singleItem.delivery_slip.slip_number }}
              </div>
            </div>
          </template>

          <template v-else>
            <div class="text-subtitle2 text-weight-bold text-primary">
              เซ็นรับรายการเอกสารทั้งหมด {{ items.length }} รายการ
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              คำเตือน: ลายเซ็นนี้จะถูกใช้บันทึกการรับเอกสารทุกรายการด้านบนพร้อมกัน
            </div>
          </template>
        </div>

        <!-- Signature Canvas -->
        <SignaturePad
          ref="sigPadRef"
          :signer-name="signerName"
          @change="onPadChange"
        />

        <div class="text-caption text-grey-6 text-center q-mt-xs">
          บันทึกวันเวลาอัตโนมัติ: {{ currentTimestamp }}
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn flat label="ยกเลิก" color="grey-7" v-close-popup />
        <q-btn
          color="positive"
          icon="check"
          label="ยืนยันการรับเอกสาร"
          unelevated
          size="md"
          :disabled="isPadEmpty"
          :loading="submitting"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDialogPluginComponent } from "quasar";
import SignaturePad from "./SignaturePad.vue";
import type { DeliveryItem } from "@/types/models";

const props = defineProps<{
  items: DeliveryItem[];
  signerName: string;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const sigPadRef = ref<InstanceType<typeof SignaturePad> | null>(null);
const isPadEmpty = ref(true);
const submitting = ref(false);

const isBatch = computed(() => props.items.length > 1);
const singleItem = computed(() => (props.items.length === 1 ? props.items[0] : null));

const currentTimestamp = computed(() =>
  new Date().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }),
);

function onPadChange(empty: boolean) {
  isPadEmpty.value = empty;
}

async function handleConfirm() {
  if (!sigPadRef.value) return;

  submitting.value = true;
  try {
    const blob = await sigPadRef.value.toBlob();
    if (!blob) return;

    onDialogOK({
      blob,
      signerName: props.signerName,
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.border-blue {
  border: 1px solid #90caf9;
}
</style>
