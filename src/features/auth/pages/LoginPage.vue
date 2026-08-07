<template>
  <q-card class="login-card overflow-hidden">
    <q-card-section class="login-card-header text-white text-center q-pa-lg">
      <div class="login-logo-container q-mx-auto q-mb-sm">
        <q-icon name="description" size="36px" color="white" />
      </div>
      <div class="text-h6 text-weight-bold tracking-tight">{{ APP_CONFIG.APP_NAME }}</div>
      <div class="text-caption text-blue-2 q-mt-xs">
        ระบบติดตามการรับส่งเอกสารภายในองค์กร
      </div>
    </q-card-section>

    <q-card-section class="q-pa-lg">
      <q-form @submit.prevent="handleLogin" class="q-gutter-md">
        <q-input
          v-model="email"
          label="อีเมล (Email)"
          type="email"
          outlined
          dense
          autofocus
          :rules="[(val) => !!val || 'กรุณากรอกอีเมล']"
        >
          <template #prepend>
            <q-icon name="email" color="grey-6" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          label="รหัสผ่าน (Password)"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          :rules="[(val) => !!val || 'กรุณากรอกรหัสผ่าน']"
        >
          <template #prepend>
            <q-icon name="lock" color="grey-6" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div v-if="errorMessage" class="badge-soft badge-soft--danger text-caption full-width justify-center q-py-xs">
          <q-icon name="error_outline" size="16px" class="q-mr-xs" />
          {{ errorMessage }}
        </div>

        <q-btn
          type="submit"
          label="เข้าสู่ระบบ"
          color="primary"
          unelevated
          block
          size="lg"
          class="full-width q-mt-md text-weight-medium"
          :loading="authStore.isLoading"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { APP_CONFIG } from "@/app.config";
import { useAuthStore } from "@/stores/auth.store";
import { useNotification } from "@/shared/composables/useNotification";

const authStore = useAuthStore();
const router = useRouter();
const notify = useNotification();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";
  try {
    await authStore.login(email.value, password.value);
    notify.success("เข้าสู่ระบบสำเร็จ");
    await router.push("/home");
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
  }
}
</script>

<style scoped lang="scss">
.login-card {
  width: 100%;
  max-width: 410px;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--neutral-border);
}

.login-card-header {
  background: linear-gradient(135deg, #1b365d 0%, #0f2341 100%);
}

.login-logo-container {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background-color: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
</style>
