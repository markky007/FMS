<template>
  <q-btn flat round dense>
    <q-avatar size="32px" color="primary" text-color="white">
      {{ avatarText }}
    </q-avatar>

    <q-menu auto-close style="min-width: 200px">
      <q-list>
        <q-item class="bg-grey-1">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="36px">
              {{ avatarText }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ authStore.fullName || "ผู้ใช้งาน" }}
            </q-item-label>
            <q-item-label caption>
              {{ roleLabel }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple to="/profile">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>โปรไฟล์ / เปลี่ยนรหัสผ่าน</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple @click="handleLogout" class="text-negative">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section>ออกจากระบบ</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLE_CONFIG, UserRole } from "@/types/enums";

const authStore = useAuthStore();
const router = useRouter();

const avatarText = computed(() => {
  const name = authStore.fullName;
  return name ? name.charAt(0).toUpperCase() : "U";
});

const roleLabel = computed(() => {
  if (!authStore.role) return "";
  return USER_ROLE_CONFIG[authStore.role as UserRole]?.label || authStore.role;
});

async function handleLogout() {
  await authStore.logout();
  await router.push("/login");
}
</script>
