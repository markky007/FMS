<template>
  <q-page class="q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">จัดการผู้ใช้งาน (User Management)</div>
    <q-card flat bordered>
      <q-card-section>
        <EmptyState
          title="ระบบจัดการผู้ใช้งาน"
          description="กำลังพัฒนาใน MS2: สร้าง/แก้ไข/ระงับบัญชีผู้ใช้"
          icon="people"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import EmptyState from "@/shared/components/EmptyState.vue";
</script>
