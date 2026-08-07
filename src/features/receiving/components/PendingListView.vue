<template>
  <PendingDataTable
    v-if="$q.screen.gt.sm"
    :items="items"
    :loading="loading"
    @sign="(item) => $emit('sign', item)"
    @batch-sign="(items) => $emit('batch-sign', items)"
  />
  <PendingCardList
    v-else
    :items="items"
    @sign="(item) => $emit('sign', item)"
  />
</template>

<script setup lang="ts">
import PendingDataTable from "./PendingDataTable.vue";
import PendingCardList from "./PendingCardList.vue";
import type { DeliveryItem } from "@/types/models";

defineProps<{
  items: DeliveryItem[];
  loading?: boolean;
}>();

defineEmits<{
  (e: "sign", item: DeliveryItem): void;
  (e: "batch-sign", items: DeliveryItem[]): void;
}>();
</script>
