<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" @click="$router.back()" class="q-mr-sm" />
      <div class="text-h6 text-weight-bold">สร้างใบส่งเอกสารใหม่</div>
    </div>

    <CreateSlipView />
  </q-page>
</template>

<script setup lang="ts">
import CreateSlipView from "../components/CreateSlipView.vue";
</script>
