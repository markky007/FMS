<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <q-btn
        v-if="showMenuButton"
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="$emit('toggle-left-drawer')"
      />

      <q-avatar square size="32px" class="q-mr-sm">
        <q-icon name="description" size="28px" />
      </q-avatar>

      <q-toolbar-title class="text-weight-bold text-subtitle1 text-md-h6">
        {{ APP_CONFIG.APP_NAME }}
      </q-toolbar-title>

      <q-space />

      <UserMenu />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { APP_CONFIG } from "@/app.config";
import UserMenu from "./UserMenu.vue";

withDefaults(
  defineProps<{
    showMenuButton?: boolean;
  }>(),
  {
    showMenuButton: true,
  },
);

defineEmits<{
  (e: "toggle-left-drawer"): void;
}>();
</script>
