<template>
  <div
    class="column items-center justify-center q-pa-xl text-grey-6 text-center"
  >
    <q-icon :name="icon" size="64px" class="q-mb-md" />
    <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
    <div v-if="description" class="text-caption text-grey-5 q-mt-xs">
      {{ description }}
    </div>
    <div v-if="$slots.action" class="q-mt-md">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    icon?: string;
  }>(),
  {
    title: "ไม่พบข้อมูล",
    description: "",
    icon: "inbox"
  }
);
</script>
