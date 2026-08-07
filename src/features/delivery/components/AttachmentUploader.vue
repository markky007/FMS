<template>
  <div>
    <div class="row items-center q-gutter-xs q-mb-xs">
      <div class="text-caption text-grey-7">แนบรูปภาพตัวอย่าง (สูงสุด 3 รูป):</div>
    </div>

    <!-- Preview thumbnails -->
    <div v-if="files.length > 0" class="row q-gutter-sm q-mb-sm">
      <div
        v-for="(f, idx) in files"
        :key="idx"
        class="relative-position overflow-hidden rounded-borders border-grey"
        style="width: 64px; height: 64px"
      >
        <q-img
          :src="getPreviewUrl(f)"
          style="width: 100%; height: 100%"
          fit="cover"
        />
        <q-btn
          round
          dense
          color="negative"
          icon="close"
          size="xs"
          class="absolute-top-right q-ma-xs"
          @click="removeFile(idx)"
        />
      </div>
    </div>

    <!-- Add file button -->
    <q-file
      v-if="files.length < maxFiles"
      v-model="newFile"
      accept="image/jpeg, image/png, image/webp"
      outlined
      dense
      capture="environment"
      class="full-width"
      @update:model-value="onFileSelected"
    >
      <template #prepend>
        <q-icon name="photo_camera" />
      </template>
      <template #default>
        <span class="text-caption text-grey-7">
          {{ files.length === 0 ? "ถ่ายรูปหรือเลือกภาพเอกสาร" : "+ เพิ่มรูปภาพอีก" }}
        </span>
      </template>
    </q-file>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useNotification } from "@/shared/composables/useNotification";

const props = withDefaults(
  defineProps<{
    maxFiles?: number;
  }>(),
  {
    maxFiles: 3,
  },
);

const emit = defineEmits<{
  (e: "update:files", files: File[]): void;
}>();

const notify = useNotification();
const files = ref<File[]>([]);
const newFile = ref<File | null>(null);

function getPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

function onFileSelected(file: File | null) {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    notify.error("ขนาดไฟล์เกิน 5MB กรุณาเลือกภาพอื่น");
    newFile.value = null;
    return;
  }

  files.value.push(file);
  newFile.value = null;
  emit("update:files", files.value);
}

function removeFile(index: number) {
  files.value.splice(index, 1);
  emit("update:files", files.value);
}
</script>

<style scoped>
.border-grey {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
