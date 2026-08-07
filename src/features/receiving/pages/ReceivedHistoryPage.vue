<template>
  <q-page class="q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">ประวัติการรับเอกสาร</div>
    <q-card flat bordered>
      <q-card-section>
        <EmptyState
          title="ยังไม่มีประวัติการรับเอกสาร"
          description="เอกสารที่คุณเซ็นรับแล้วจะถูกบันทึกประวัติไว้ที่นี่"
          icon="history"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import EmptyState from "@/shared/components/EmptyState.vue";
</script>
