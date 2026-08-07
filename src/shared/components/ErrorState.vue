<template>
  <div class="column items-center justify-center q-pa-xl text-center">
    <q-icon name="error_outline" color="negative" size="60px" class="q-mb-md" />
    <div class="text-subtitle1 text-weight-medium text-negative">
      {{ title }}
    </div>
    <div class="text-body2 text-grey-7 q-mt-xs">{{ message }}</div>
    <q-btn
      v-if="retryable"
      flat
      color="primary"
      icon="refresh"
      label="ลองใหม่อีกครั้ง"
      class="q-mt-md"
      @click="$emit('retry')"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    message?: string;
    retryable?: boolean;
  }>(),
  {
    title: "เกิดข้อผิดพลาด",
    message: "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
    retryable: true,
  },
);

defineEmits<{
  (e: "retry"): void;
}>();
</script>
