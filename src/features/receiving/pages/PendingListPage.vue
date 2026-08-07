<template>
  <q-page class="q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">รายการรอรับเอกสาร</div>
    <q-card flat bordered>
      <q-card-section>
        <EmptyState
          title="ไม่มีเอกสารค้างรับ"
          description="รายการเอกสารที่ส่งมาถึงคุณจะปรากฏที่นี่เพื่อรอการเซ็นรับ"
          icon="inbox"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import EmptyState from "@/shared/components/EmptyState.vue";
</script>
