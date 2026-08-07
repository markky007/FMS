<template>
  <div>
    <div class="row items-center q-gutter-xs q-mb-xs">
      <div class="text-caption text-grey-7">
        แนบไฟล์เอกสาร (รูปภาพ, PDF, Word, Excel, CSV - สูงสุด 3 ไฟล์):
      </div>
    </div>

    <!-- Preview items list -->
    <div v-if="files.length > 0" class="row q-gutter-sm q-mb-sm">
      <div
        v-for="(f, idx) in files"
        :key="idx"
        class="relative-position overflow-hidden rounded-borders border-grey flex flex-center bg-grey-2"
        style="width: 72px; height: 72px"
      >
        <!-- Image thumbnail -->
        <q-img
          v-if="isImageFile(f)"
          :src="getPreviewUrl(f)"
          style="width: 100%; height: 100%"
          fit="cover"
        />
        <!-- Document File Icon Badge -->
        <div v-else class="column items-center justify-center text-center q-pa-xs">
          <q-icon :name="getFileIcon(f)" :color="getFileIconColor(f)" size="28px" />
          <div class="text-caption text-weight-bold ellipsis full-width text-center style-name">
            {{ getExtLabel(f) }}
          </div>
        </div>

        <!-- Remove file button -->
        <q-btn
          round
          dense
          color="negative"
          icon="close"
          size="xs"
          class="absolute-top-right q-ma-xs shadow-1"
          @click="removeFile(idx)"
        />
      </div>
    </div>

    <!-- Add file input button -->
    <q-file
      v-if="files.length < maxFiles"
      v-model="newFile"
      accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx, .csv"
      outlined
      dense
      class="full-width"
      @update:model-value="onFileSelected"
    >
      <template #prepend>
        <q-icon name="attach_file" />
      </template>
      <template #default>
        <span class="text-caption text-grey-7">
          {{ files.length === 0 ? "ถ่ายรูปหรือเลือกไฟล์เอกสาร (PDF, Word, Excel, CSV)" : "+ เพิ่มไฟล์อีก" }}
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

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function getExtLabel(file: File): string {
  const ext = file.name.split(".").pop()?.toUpperCase();
  return ext || "DOC";
}

function getFileIcon(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "picture_as_pdf";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "description";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv"))
    return "table_chart";
  return "insert_drive_file";
}

function getFileIconColor(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "red-9";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "blue-9";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv"))
    return "green-9";
  return "primary";
}

function getPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

function onFileSelected(file: File | null) {
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    notify.error("ขนาดไฟล์เกิน 10MB กรุณาเลือกไฟล์อื่น");
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
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.style-name {
  font-size: 10px;
  line-height: 1.1;
}
</style>
