<template>
  <q-page class="q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">ข้อมูลส่วนตัว (Profile)</div>
    <q-card flat bordered style="max-width: 500px">
      <q-card-section class="text-center">
        <q-avatar size="72px" color="primary" text-color="white" class="q-mb-sm">
          {{ authStore.fullName ? authStore.fullName.charAt(0) : "U" }}
        </q-avatar>
        <div class="text-h6 text-weight-bold">{{ authStore.fullName }}</div>
        <div class="text-caption text-grey-7">{{ authStore.profile?.email }}</div>
        <q-chip size="sm" :color="roleConfig.color" text-color="white" class="q-mt-xs">
          {{ roleConfig.label }}
        </q-chip>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLE_CONFIG, UserRole } from "@/types/enums";

const authStore = useAuthStore();

const roleConfig = computed(() => {
  if (!authStore.role) return { label: "", color: "grey" };
  return USER_ROLE_CONFIG[authStore.role as UserRole] || { label: authStore.role, color: "grey" };
});
</script>
