<template>
  <q-page class="q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">Audit Log</div>
    <q-card flat bordered>
      <q-card-section>
        <EmptyState
          title="ระบบ Audit Log"
          description="บันทึกประวัติการทำรายการย้อนหลังทั้งหมด"
          icon="history_edu"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import EmptyState from "@/shared/components/EmptyState.vue";
</script>
