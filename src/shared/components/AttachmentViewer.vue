<template>
  <div>
    <div v-if="attachments && attachments.length > 0" class="row q-gutter-xs">
      <q-chip
        v-for="att in attachments"
        :key="att.id"
        clickable
        dense
        color="grey-3"
        text-color="primary"
        icon="image"
        @click="openImage(att)"
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

async function openImage(att: ItemAttachment) {
  activeFileName.value = att.file_name;
  activeUrl.value = null;
  showDialog.value = true;

  const url = await getSignedUrl(
    APP_CONFIG.STORAGE_BUCKETS.ATTACHMENTS,
    att.storage_path,
  );
  activeUrl.value = url;
}
</script>
