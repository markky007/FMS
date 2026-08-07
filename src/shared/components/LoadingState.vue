<template>
  <div class="column items-center justify-center q-pa-xl">
    <q-spinner-dots color="primary" size="40px" />
    <div class="text-caption text-grey-6 q-mt-sm">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string;
  }>(),
  {
    message: "กำลังโหลดข้อมูล..."
  }
);
</script>
