<template>
  <SlipDataTable
    v-if="$q.screen.gt.sm"
    :slips="slips"
    :loading="loading"
    @select="s => $emit('select', s)"
  />
  <SlipCardList v-else :slips="slips" @select="s => $emit('select', s)" />
</template>

<script setup lang="ts">
import SlipDataTable from "./SlipDataTable.vue";
import SlipCardList from "./SlipCardList.vue";
import type { DeliverySlip } from "@/types/models";

defineProps<{
  slips: DeliverySlip[];
  loading?: boolean;
}>();

defineEmits<{
  (e: "select", slip: DeliverySlip): void;
}>();
</script>
