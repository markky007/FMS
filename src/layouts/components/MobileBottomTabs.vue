<template>
  <q-footer elevated class="bg-white text-grey-8 border-top">
    <q-tabs
      v-model="activeTab"
      dense
      align="justify"
      active-color="primary"
      indicator-color="primary"
      class="text-grey-7"
    >
      <q-route-tab
        name="home"
        to="/home"
        icon="home"
        label="หน้าหลัก"
        exact
      />

      <q-route-tab
        v-if="authStore.isStaff || authStore.isAdmin"
        name="create"
        to="/delivery/create"
        icon="add_circle"
        label="สร้าง"
        class="text-positive text-weight-bold"
      />

      <q-route-tab
        v-if="authStore.isStaff || authStore.isAdmin"
        name="receiving"
        to="/receiving"
        icon="inbox"
        label="รอรับ"
        exact
      >
        <q-badge
          v-if="notificationStore.pendingCount > 0"
          color="negative"
          floating
          pill
        >
          {{ notificationStore.pendingCount }}
        </q-badge>
      </q-route-tab>

      <q-route-tab
        name="profile"
        to="/profile"
        icon="person"
        label="โปรไฟล์"
        exact
      />
    </q-tabs>
  </q-footer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const activeTab = ref("home");
</script>

<style scoped lang="scss">
.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
