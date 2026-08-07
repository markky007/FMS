<template>
  <CreateSlipStepper v-if="$q.screen.lt.md" />
  <CreateSlipInline v-else />
</template>

<script setup lang="ts">
import CreateSlipStepper from "./CreateSlipStepper.vue";
import CreateSlipInline from "./CreateSlipInline.vue";
</script>
