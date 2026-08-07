<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" @click="$router.back()" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">รายละเอียดใบส่งเอกสาร</div>
      </div>
      <q-btn
        flat
        icon="refresh"
        label="รีเฟรช"
        color="primary"
        :loading="slipStore.isLoading"
        @click="loadData"
      />
    </div>

    <LoadingState v-if="slipStore.isLoading" />

    <SlipDetail
      v-else-if="slipStore.currentSlip"
      :slip="slipStore.currentSlip"
      :items="slipStore.currentItems"
      @refresh="loadData"
    />

    <ErrorState
      v-else
      title="ไม่พบข้อมูลใบส่งเอกสาร"
      message="ใบส่งเอกสารนี้อาจถูกลบ หรือคุณไม่มีสิทธิ์เข้าถึง"
      @retry="loadData"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useDeliverySlipStore } from "@/stores/delivery-slip.store";
import SlipDetail from "../components/SlipDetail.vue";
import LoadingState from "@/shared/components/LoadingState.vue";
import ErrorState from "@/shared/components/ErrorState.vue";

const route = useRoute();
const slipStore = useDeliverySlipStore();

async function loadData() {
  const slipId = route.params.id as string;
  if (slipId) {
    await slipStore.fetchSlipDetail(slipId);
  }
}

onMounted(() => {
  loadData();
});

onUnmounted(() => {
  slipStore.clearCurrent();
});
</script>
