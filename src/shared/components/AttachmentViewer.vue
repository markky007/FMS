<template>
  <div>
    <div
      v-if="attachments && attachments.length > 0"
      class="row q-gutter-xs items-center justify-center"
    >
      <q-btn
        v-for="att in attachments"
        :key="att.id"
        dense
        unelevated
        no-caps
        size="sm"
        :color="getBtnColor(att)"
        :icon="getBtnIcon(att)"
        :label="truncateFileName(att.file_name)"
        :loading="loadingId === att.id"
        class="q-px-sm shadow-1 border-radius-sm"
        @click.stop.prevent="openAttachment(att)"
      >
        <q-tooltip>เปิดดูไฟล์ {{ att.file_name }}</q-tooltip>
      </q-btn>
    </div>
    <span v-else class="text-caption text-grey-5">-</span>

    <!-- Image Preview Modal -->
    <q-dialog
      v-model="showDialog"
      maximized
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card class="bg-black text-white flex flex-center relative-position">
        <q-btn
          icon="close"
          flat
          round
          dense
          color="white"
          size="lg"
          class="absolute-top-right q-ma-md z-max"
          v-close-popup
        />
        <div v-if="activeUrl" class="text-center q-pa-md full-width">
          <q-img
            :src="activeUrl"
            style="max-width: 90vw; max-height: 80vh"
            fit="contain"
          />
          <div class="text-subtitle1 q-mt-md">{{ activeFileName }}</div>
          <div class="q-mt-sm">
            <q-btn
              color="primary"
              icon="open_in_new"
              label="เปิดไฟล์ในแท็บใหม่"
              unelevated
              size="sm"
              @click="openInNewTab(activeUrl)"
            />
          </div>
        </div>
        <q-spinner v-else color="primary" size="50px" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStorage } from "@/shared/composables/useStorage";
import { useNotification } from "@/shared/composables/useNotification";
import { APP_CONFIG } from "@/app.config";
import type { ItemAttachment } from "@/types/models";

defineProps<{
  attachments?: ItemAttachment[] | undefined;
}>();

const { getSignedUrl } = useStorage();
const notify = useNotification();

const showDialog = ref(false);
const activeUrl = ref<string | null>(null);
const activeFileName = ref("");
const loadingId = ref<string | null>(null);

function truncateFileName(name: string): string {
  if (name.length <= 15) return name;
  const ext = name.split(".").pop();
  return `${name.substring(0, 10)}...${ext}`;
}

function isImage(att: ItemAttachment): boolean {
  if (att.mime_type && att.mime_type.startsWith("image/")) return true;
  const name = att.file_name.toLowerCase();
  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

function getBtnIcon(att: ItemAttachment): string {
  const name = att.file_name.toLowerCase();
  if (name.endsWith(".pdf")) return "picture_as_pdf";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "description";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv"))
    return "table_chart";
  return "image";
}

function getBtnColor(att: ItemAttachment): string {
  const name = att.file_name.toLowerCase();
  if (name.endsWith(".pdf")) return "negative";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "primary";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv"))
    return "positive";
  return "info";
}

async function openAttachment(att: ItemAttachment) {
  loadingId.value = att.id;
  try {
    const url = await getSignedUrl(
      APP_CONFIG.STORAGE_BUCKETS.ATTACHMENTS,
      att.storage_path
    );

    if (!url) {
      notify.error(`ไม่สามารถโหลดไฟล์ ${att.file_name} ได้`);
      return;
    }

    if (isImage(att)) {
      activeFileName.value = att.file_name;
      activeUrl.value = url;
      showDialog.value = true;
    } else {
      window.open(url, "_blank");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "เปิดไฟล์ไม่สำเร็จ";
    notify.error(msg);
  } finally {
    loadingId.value = null;
  }
}

function openInNewTab(url: string) {
  window.open(url, "_blank");
}
</script>

<style scoped>
.border-radius-sm {
  border-radius: 6px;
}
</style>
