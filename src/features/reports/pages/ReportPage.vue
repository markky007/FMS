<template>
  <q-page class="q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">รายงานสรุป & Export</div>
    <q-card flat bordered>
      <q-card-section>
        <EmptyState
          title="ระบบรายงานสรุป"
          description="กำลังพัฒนาใน MS5: Export PDF รายงานสรุปตามช่วงเวลาและสาขา"
          icon="assessment"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import EmptyState from "@/shared/components/EmptyState.vue";
</script>
