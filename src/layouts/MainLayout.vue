<template>
  <MobileLayout v-if="$q.screen.lt.md" />
  <DesktopLayout v-else />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import DesktopLayout from "./DesktopLayout.vue";
import MobileLayout from "./MobileLayout.vue";
import { useDepartmentStore } from "@/stores/department.store";
import { useUserDirectoryStore } from "@/stores/user-directory.store";
import { useNotificationStore } from "@/stores/notification.store";

const departmentStore = useDepartmentStore();
const userDirectoryStore = useUserDirectoryStore();
const notificationStore = useNotificationStore();

onMounted(async () => {
  // Pre-load reference data on layout mount
  await Promise.allSettled([
    departmentStore.fetchAll(),
    userDirectoryStore.fetchAll(),
    notificationStore.fetchPendingCount(),
  ]);

  notificationStore.subscribeToPending();
});

onUnmounted(() => {
  notificationStore.unsubscribe();
});
</script>
