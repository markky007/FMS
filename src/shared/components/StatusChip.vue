<template>
  <q-chip
    :color="config.color"
    text-color="white"
    :size="size"
    :dense="dense"
    :icon="showIcon ? config.icon : undefined"
  >
    {{ config.label }}
  </q-chip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { SlipStatus, SLIP_STATUS_CONFIG } from "@/types/enums";

const props = withDefaults(
  defineProps<{
    status: SlipStatus | string;
    size?: string;
    dense?: boolean;
    showIcon?: boolean;
  }>(),
  {
    size: "md",
    dense: false,
    showIcon: true,
  },
);

const config = computed(() => {
  const s = props.status as SlipStatus;
  return (
    SLIP_STATUS_CONFIG[s] || {
      label: props.status,
      color: "grey",
      icon: "help_outline",
    }
  );
});
</script>
