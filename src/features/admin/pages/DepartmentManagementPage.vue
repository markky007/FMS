<template>
  <q-page class="q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-md">จัดการสาขา / แผนก (Departments)</div>
    <q-card flat bordered>
      <q-card-section>
        <EmptyState
          title="ระบบจัดการสาขาและแผนก"
          description="กำลังพัฒนาใน MS2: เพิ่ม/แก้ไข/ปิดใช้งานสาขาและแผนก"
          icon="account_tree"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import EmptyState from "@/shared/components/EmptyState.vue";
</script>
