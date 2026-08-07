<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-bold">ใบส่งของฉัน</div>
      <q-btn
        color="positive"
        icon="add"
        label="สร้างใบส่งเอกสาร"
        to="/delivery/create"
        unelevated
      />
    </div>

    <q-card flat bordered>
      <q-card-section>
        <EmptyState
          title="ยังไม่มีใบส่งเอกสาร"
          description="กดปุ่ม 'สร้างใบส่งเอกสาร' เพื่อเริ่มต้นส่งเอกสาร"
          icon="outbox"
        >
          <template #action>
            <q-btn
              color="primary"
              label="สร้างใบส่งเอกสารใหม่"
              to="/delivery/create"
              unelevated
            />
          </template>
        </EmptyState>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import EmptyState from "@/shared/components/EmptyState.vue";
</script>
