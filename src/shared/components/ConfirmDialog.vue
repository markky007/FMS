<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-width: 320px">
      <q-card-section class="row items-center q-pb-none">
        <q-icon :name="icon" :color="color" size="28px" class="q-mr-sm" />
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-card-section class="q-pt-sm text-body2 text-grey-8">
        {{ message }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="cancelLabel" color="grey-7" v-close-popup />
        <q-btn unelevated :label="okLabel" :color="color" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";

withDefaults(
  defineProps<{
    title?: string;
    message: string;
    okLabel?: string;
    cancelLabel?: string;
    color?: string;
    icon?: string;
  }>(),
  {
    title: "ยืนยันการทำรายการ",
    okLabel: "ตกลง",
    cancelLabel: "ยกเลิก",
    color: "primary",
    icon: "help_outline"
  }
);

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

function onOKClick() {
  onDialogOK();
}
</script>
