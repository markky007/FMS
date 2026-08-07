<template>
  <q-card class="login-card shadow-10 rounded-borders overflow-hidden">
    <q-card-section class="bg-primary text-white text-center q-pa-lg">
      <q-icon name="description" size="48px" class="q-mb-sm" />
      <div class="text-h6 text-weight-bold">{{ APP_CONFIG.APP_NAME }}</div>
      <div class="text-caption text-blue-2">
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
            <q-icon name="email" />
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
            <q-icon name="lock" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div v-if="errorMessage" class="text-negative text-caption text-center">
          {{ errorMessage }}
        </div>

        <q-btn
          type="submit"
          label="เข้าสู่ระบบ"
          color="primary"
          unelevated
          block
          size="lg"
          class="full-width q-mt-md"
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
  max-width: 400px;
}
</style>
