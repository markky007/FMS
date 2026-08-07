<template>
  <q-card
    flat
    bordered
    class="stat-card overflow-hidden cursor-pointer relative-position hover-lift"
    :class="`border-${color}`"
    @click="$emit('click')"
  >
    <q-card-section class="q-pa-md">
      <div class="row items-center justify-between no-wrap">
        <div>
          <div class="text-caption text-weight-bold text-uppercase text-grey-7">
            {{ title }}
          </div>
          <div
            class="text-h4 text-weight-bolder tabular-nums q-mt-xs"
            :class="`text-${color}`"
          >
            {{ value }}
          </div>
          <div v-if="subtitle" class="text-caption text-grey-6 q-mt-xs">
            {{ subtitle }}
          </div>
        </div>

        <q-avatar
          size="44px"
          :color="color"
          text-color="white"
          class="stat-avatar"
        >
          <q-icon :name="icon" size="24px" />
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
    color: "primary"
  }
);

defineEmits<{
  (e: "click"): void;
}>();
</script>

<style scoped lang="scss">
.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  background-color: var(--neutral-surface);
  border: 1px solid var(--neutral-border);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-avatar {
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
}

.border-primary {
  border-left: 4px solid var(--brand-primary) !important;
}
.border-positive {
  border-left: 4px solid var(--color-success) !important;
}
.border-warning {
  border-left: 4px solid var(--color-warning) !important;
}
.border-negative {
  border-left: 4px solid var(--color-danger) !important;
}
.border-purple {
  border-left: 4px solid #8b5cf6 !important;
}
</style>
