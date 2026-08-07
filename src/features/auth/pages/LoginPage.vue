<template>
  <div class="login-page-wrapper flex flex-center full-width full-height relative-position">
    <!-- Dynamic Animated Background Layer -->
    <LoginBackground />

    <!-- Main Entrance Form Card -->
    <q-card
      class="login-card overflow-hidden relative-position z-top"
      :class="{ 'shake-error': isShaking }"
    >
      <!-- Header Banner with Official Seal Badge -->
      <q-card-section class="login-card-header text-white text-center q-pa-lg">
        <!-- Official Seal Badge Logo (Elastic Drop Spring) -->
        <div class="seal-logo-wrapper entrance-seal q-mx-auto q-mb-md">
          <div class="seal-logo-inner flex flex-center">
            <q-icon name="description" size="32px" color="white" />
          </div>
          <div class="seal-gold-ring" />
        </div>

        <!-- Title & Subtitle Entrance -->
        <div class="entrance-title">
          <div class="text-h6 text-weight-bold tracking-tight text-white">
            {{ APP_CONFIG.APP_NAME }}
          </div>
          <div class="text-caption text-amber-2 q-mt-xs font-medium">
            ระบบติดตามการรับส่งเอกสารภายในองค์กร
          </div>
        </div>
      </q-card-section>

      <!-- Card Form Section -->
      <q-card-section class="q-pa-lg">
        <q-form @submit.prevent="handleLogin" class="q-gutter-y-md">
          <!-- Email Field -->
          <div class="entrance-input input-wrapper">
            <q-input
              v-model="email"
              label="อีเมล (Email)"
              type="email"
              outlined
              autofocus
              :disabled="authStore.isLoading || isSuccess"
              :rules="[(val) => !!val || 'กรุณากรอกอีเมล']"
              class="custom-animated-input"
            >
              <template #prepend>
                <q-icon name="email" color="grey-6" />
              </template>
            </q-input>
          </div>

          <!-- Password Field -->
          <div class="entrance-input input-wrapper">
            <q-input
              v-model="password"
              label="รหัสผ่าน (Password)"
              :type="showPassword ? 'text' : 'password'"
              outlined
              :disabled="authStore.isLoading || isSuccess"
              :rules="[(val) => !!val || 'กรุณากรอกรหัสผ่าน']"
              class="custom-animated-input"
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
          </div>

          <!-- Soft Error Badge Alert -->
          <transition name="slide-fade">
            <div
              v-if="errorMessage"
              class="badge-soft badge-soft--danger text-caption full-width justify-center q-py-xs q-my-xs"
            >
              <q-icon name="error_outline" size="16px" class="q-mr-xs" />
              {{ errorMessage }}
            </div>
          </transition>

          <!-- Submit Button with Custom Morphing Seal Pulse & Success Burst -->
          <div class="entrance-btn q-mt-md">
            <q-btn
              type="submit"
              color="primary"
              unelevated
              size="lg"
              class="login-submit-btn full-width text-weight-medium"
              :class="{ 'btn-success-burst': isSuccess }"
              :disabled="authStore.isLoading || isSuccess"
            >
              <!-- Success Burst State -->
              <template v-if="isSuccess">
                <div class="row items-center justify-center gap-xs text-white">
                  <q-icon name="check_circle" size="22px" class="success-ripple" />
                  <span>ยืนยันตัวตนเรียบร้อย!</span>
                </div>
              </template>

              <!-- Loading Seal Pulse State -->
              <template v-else-if="authStore.isLoading">
                <div class="row items-center justify-center gap-sm">
                  <div class="seal-pulse-ring" />
                  <span>กำลังตรวจสอบข้อมูลเอกสาร...</span>
                </div>
              </template>

              <!-- Normal Button Label -->
              <template v-else>
                <div class="row items-center justify-center gap-xs">
                  <span>เข้าสู่ระบบ</span>
                  <q-icon name="arrow_forward" size="18px" class="btn-arrow-icon" />
                </div>
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { APP_CONFIG } from "@/app.config";
import { useAuthStore } from "@/stores/auth.store";
import { useNotification } from "@/shared/composables/useNotification";
import LoginBackground from "../components/LoginBackground.vue";

const authStore = useAuthStore();
const router = useRouter();
const notify = useNotification();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
const isShaking = ref(false);
const isSuccess = ref(false);

function triggerShake() {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 450);
}

async function handleLogin() {
  errorMessage.value = "";
  try {
    await authStore.login(email.value, password.value);
    
    // Verification Stamp Burst Transition
    isSuccess.value = true;
    notify.success("เข้าสู่ระบบสำเร็จ");

    setTimeout(async () => {
      await router.push("/home");
    }, 700);
  } catch (err) {
    triggerShake();
    errorMessage.value =
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
  }
}
</script>

<style scoped lang="scss">
.login-page-wrapper {
  min-height: 100vh;
  width: 100vw;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 410px;
  border-radius: 14px;
  background-color: var(--neutral-surface);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
  
  // Entrance Animation Sequence
  animation: cardRise 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardRise {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-card-header {
  background: linear-gradient(135deg, #1b365d 0%, #0f2341 100%);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #d97706 0%, #b45309 100%);
  }
}

// Seal Badge Logo Drop Spring Animation
.seal-logo-wrapper {
  position: relative;
  width: 58px;
  height: 58px;
  margin: 0 auto;
}

.seal-logo-inner {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.seal-gold-ring {
  position: absolute;
  inset: -3px;
  border-radius: 19px;
  border: 1.5px dashed rgba(217, 119, 6, 0.5);
  pointer-events: none;
  animation: ringRotate 20s linear infinite;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Staggered Entrance Animations
.entrance-seal {
  animation: sealDrop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms both;
}

.entrance-title {
  animation: textSlideUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 350ms both;
}

.entrance-input {
  animation: inputSlideUp 350ms cubic-bezier(0.16, 1, 0.3, 1) 500ms both;
}

.entrance-btn {
  animation: inputSlideUp 350ms cubic-bezier(0.16, 1, 0.3, 1) 650ms both;
}

@keyframes sealDrop {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.7);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes textSlideUp {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes inputSlideUp {
  0% {
    opacity: 0;
    transform: translateY(14px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Input Focus Aura Glow & Left Accent Seal Bar
.custom-animated-input {
  :deep(.q-field__control) {
    border-radius: 8px;
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &.q-field--focused :deep(.q-field__control) {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.15);

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: var(--brand-accent);
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
  }
}

// Submit Button Styling & Micro-interactions
.login-submit-btn {
  height: 48px;
  border-radius: 8px;
  background: var(--brand-primary) !important;
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 150ms ease, background-color 300ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(27, 54, 93, 0.28);

    .btn-arrow-icon {
      transform: translateX(4px);
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.btn-arrow-icon {
  transition: transform 150ms ease;
}

// Custom Morphing Seal Pulse Ring
.seal-pulse-ring {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-right-color: #d97706;
  border-radius: 50%;
  animation: sealSpin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}

@keyframes sealSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Soft Error Shake Motion
.shake-error {
  animation: softShake 450ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
}

@keyframes softShake {
  10.7%, 90% { transform: translate3d(-1px, 0, 0); }
  21.4%, 78.5% { transform: translate3d(3px, 0, 0); }
  32.1%, 53.5%, 64.2% { transform: translate3d(-5px, 0, 0); }
  42.8%, 49.9% { transform: translate3d(5px, 0, 0); }
}

// Verification Stamp Burst State
.btn-success-burst {
  background-color: #059669 !important;

  .success-ripple {
    animation: stampRipple 500ms ease-out forwards;
  }
}

@keyframes stampRipple {
  0% { transform: scale(0.7); opacity: 0; }
  50% { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

// Transition for Error Badge
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Accessibility: prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .login-card,
  .entrance-seal,
  .entrance-title,
  .entrance-input,
  .entrance-btn,
  .shake-error,
  .seal-gold-ring,
  .seal-pulse-ring {
    animation: none !important;
    transform: none !important;
  }
}
</style>
