<template>
  <div class="login-bg-container" aria-hidden="true">
    <!-- Ambient Radial Glow -->
    <div class="ambient-orb" :class="{ 'is-reduced': isLowPerformance }" />
    <div class="ambient-orb-secondary" :class="{ 'is-reduced': isLowPerformance }" />

    <!-- Vector Wave Contours -->
    <svg
      class="wave-svg-layer"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        class="wave-path wave-1"
        :class="{ 'is-reduced': isLowPerformance }"
        d="M0 300C300 200 600 400 900 300C1200 200 1440 350 1440 350V900H0V300Z"
        fill="url(#wave-grad-1)"
      />
      <path
        class="wave-path wave-2"
        :class="{ 'is-reduced': isLowPerformance }"
        d="M0 450C400 350 700 500 1100 400C1300 350 1440 450 1440 450V900H0V450Z"
        fill="url(#wave-grad-2)"
      />
      <defs>
        <linearGradient id="wave-grad-1" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1B365D" stop-opacity="0.35" />
          <stop offset="1" stop-color="#0F172A" stop-opacity="0.85" />
        </linearGradient>
        <linearGradient id="wave-grad-2" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
          <stop stop-color="#D97706" stop-opacity="0.12" />
          <stop offset="1" stop-color="#1B365D" stop-opacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const isLowPerformance = ref(false);

onMounted(() => {
  // Performance Safeguard: check CPU cores & screen width
  const concurrency = navigator.hardwareConcurrency || 4;
  const isMobileScreen = window.innerWidth < 600;

  if (concurrency <= 2 || isMobileScreen) {
    isLowPerformance.value = true;
  }
});
</script>

<style scoped lang="scss">
.login-bg-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #090d16 0%, #0f172a 45%, #1b365d 100%);
  z-index: 0;
  pointer-events: none;
}

.ambient-orb {
  position: absolute;
  top: -15%;
  left: 15%;
  width: 650px;
  height: 650px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.16) 0%, rgba(27, 54, 93, 0) 70%);
  filter: blur(40px);
  animation: orbPulse 9s ease-in-out infinite alternate;

  &.is-reduced {
    animation: none;
    opacity: 0.7;
  }
}

.ambient-orb-secondary {
  position: absolute;
  bottom: -10%;
  right: 10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
  filter: blur(50px);
  animation: orbPulse 12s ease-in-out infinite alternate-reverse;

  &.is-reduced {
    animation: none;
    opacity: 0.6;
  }
}

.wave-svg-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.wave-path {
  transform-origin: center;

  &.wave-1 {
    animation: waveFloat 14s ease-in-out infinite alternate;
  }

  &.wave-2 {
    animation: waveFloat 10s ease-in-out infinite alternate-reverse;
  }

  &.is-reduced {
    animation: none !important;
  }
}

@keyframes orbPulse {
  0% {
    transform: scale(0.9) translateY(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.1) translateY(24px);
    opacity: 0.85;
  }
}

@keyframes waveFloat {
  0% {
    transform: translateY(0) scaleY(1);
  }
  100% {
    transform: translateY(-16px) scaleY(1.04);
  }
}

/* Accessibility: prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ambient-orb,
  .ambient-orb-secondary,
  .wave-path {
    animation: none !important;
    transform: none !important;
  }
}
</style>
