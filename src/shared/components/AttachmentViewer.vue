<template>
  <div>
    <div v-if="attachments && attachments.length > 0" class="row q-gutter-xs">
      <q-chip
        v-for="att in attachments"
        :key="att.id"
        clickable
        dense
        color="grey-3"
        :text-color="getChipColor(att)"
        :icon="getChipIcon(att)"
        @click="openAttachment(att)"
      >
        {{ att.file_name }}
      </q-chip>
    </div>
    <span v-else class="text-caption text-grey-5">-</span>

    <!-- Image Dialog Viewer -->
    <q-dialog v-model="showDialog" maximized transition-show="fade" transition-hide="fade">
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
        </div>
        <q-spinner v-else color="primary" size="50px" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStorage } from "@/shared/composables/useStorage";
import { APP_CONFIG } from "@/app.config";
import type { ItemAttachment } from "@/types/models";

const props = defineProps<{
  attachments?: ItemAttachment[] | undefined;
}>();

const { getSignedUrl } = useStorage();
const showDialog = ref(false);
const activeUrl = ref<string | null>(null);
const activeFileName = ref("");

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

function getChipIcon(att: ItemAttachment): string {
  const name = att.file_name.toLowerCase();
  if (name.endsWith(".pdf")) return "picture_as_pdf";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "description";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv"))
    return "table_chart";
  return "image";
}

function getChipColor(att: ItemAttachment): string {
  const name = att.file_name.toLowerCase();
  if (name.endsWith(".pdf")) return "red-9";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "blue-9";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv"))
    return "green-9";
  return "primary";
}

async function openAttachment(att: ItemAttachment) {
  const url = await getSignedUrl(
    APP_CONFIG.STORAGE_BUCKETS.ATTACHMENTS,
    att.storage_path,
  );

  if (!url) return;

  if (isImage(att)) {
    activeFileName.value = att.file_name;
    activeUrl.value = url;
    showDialog.value = true;
  } else {
    // Open PDF / Word / Excel / CSV in new tab for viewing / download
    window.open(url, "_blank");
  }
}
</script>
