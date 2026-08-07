<template>
  <q-card
    flat
    bordered
    class="stat-card overflow-hidden cursor-pointer relative-position hover-lift"
    :class="`bg-${color}-1 border-${color}`"
    @click="$emit('click')"
  >
    <q-card-section class="q-pa-md">
      <div class="row items-center justify-between no-wrap">
        <div>
          <div class="text-caption text-weight-bold text-uppercase text-grey-7">
            {{ title }}
          </div>
          <div class="text-h4 text-weight-bolder q-mt-xs" :class="`text-${color}`">
            {{ value }}
          </div>
          <div v-if="subtitle" class="text-caption text-grey-6 q-mt-xs">
            {{ subtitle }}
          </div>
        </div>

        <q-avatar
          size="48px"
          :color="color"
          text-color="white"
          class="shadow-2"
        >
          <q-icon :name="icon" size="28px" />
        </q-avatar>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    value: number | string;
    subtitle?: string;
    icon: string;
    color?: string;
  }>(),
  {
    color: "primary",
  },
);

defineEmits<{
  (e: "click"): void;
}>();
</script>

<style scoped lang="scss">
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.border-primary {
  border-left: 4px solid #1976d2 !important;
}
.border-positive {
  border-left: 4px solid #21ba45 !important;
}
.border-warning {
  border-left: 4px solid #f2c037 !important;
}
.border-negative {
  border-left: 4px solid #c10015 !important;
}
.border-purple {
  border-left: 4px solid #9c27b0 !important;
}
</style>
