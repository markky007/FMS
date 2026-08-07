<template>
  <q-list padding class="rounded-borders">
    <q-item-label header class="text-weight-bold text-uppercase text-grey-7">
      เมนูหลัก
    </q-item-label>

    <q-item clickable v-ripple to="/home" active-class="sidebar-item-active">
      <q-item-section avatar>
        <q-icon name="dashboard" />
      </q-item-section>
      <q-item-section>หน้าหลัก</q-item-section>
    </q-item>

    <template v-if="authStore.isStaff || authStore.isAdmin">
      <q-item
        clickable
        v-ripple
        to="/delivery/create"
        active-class="sidebar-item-active"
      >
        <q-item-section avatar>
          <q-icon name="post_add" color="positive" />
        </q-item-section>
        <q-item-section class="text-weight-medium text-positive">
          สร้างใบส่งเอกสาร
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        to="/delivery"
        exact
        active-class="sidebar-item-active"
      >
        <q-item-section avatar>
          <q-icon name="outbox" />
        </q-item-section>
        <q-item-section>ใบส่งของฉัน</q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        to="/receiving"
        exact
        active-class="sidebar-item-active"
      >
        <q-item-section avatar>
          <q-icon name="inbox" />
        </q-item-section>
        <q-item-section>รอรับเอกสาร</q-item-section>
        <q-item-section side v-if="notificationStore.pendingCount > 0">
          <q-badge color="negative" floating pill>
            {{ notificationStore.pendingCount }}
          </q-badge>
        </q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        to="/receiving/history"
        active-class="sidebar-item-active"
      >
        <q-item-section avatar>
          <q-icon name="history" />
        </q-item-section>
        <q-item-section>ประวัติการรับ</q-item-section>
      </q-item>
    </template>

    <template v-if="authStore.isManagerOrAdmin">
      <q-separator class="q-my-sm" />
      <q-item-label header class="text-weight-bold text-uppercase text-grey-7">
        รายงาน
      </q-item-label>

      <q-item
        clickable
        v-ripple
        to="/reports"
        active-class="sidebar-item-active"
      >
        <q-item-section avatar>
          <q-icon name="assessment" />
        </q-item-section>
        <q-item-section>รายงานสรุป</q-item-section>
      </q-item>
    </template>

    <template v-if="authStore.isAdmin">
      <q-separator class="q-my-sm" />
      <q-item-label header class="text-weight-bold text-uppercase text-grey-7">
        การดูแลระบบ
      </q-item-label>

      <q-item
        clickable
        v-ripple
        to="/admin/users"
        active-class="sidebar-item-active"
      >
        <q-item-section avatar>
          <q-icon name="people" />
        </q-item-section>
        <q-item-section>จัดการผู้ใช้งาน</q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        to="/admin/departments"
        active-class="sidebar-item-active"
      >
        <q-item-section avatar>
          <q-icon name="account_tree" />
        </q-item-section>
        <q-item-section>จัดการสาขา / แผนก</q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
</script>
