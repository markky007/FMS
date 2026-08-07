<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">
          สวัสดี, {{ authStore.fullName || "ผู้ใช้งาน" }}
        </div>
        <div class="text-caption text-grey-7">
          ยินดีต้อนรับสู่ระบบติดตามการรับส่งเอกสาร
        </div>
      </div>
      <q-chip :color="roleConfig.color" text-color="white">
        {{ roleConfig.label }}
      </q-chip>
    </div>

    <!-- Quick Actions -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-if="authStore.isStaff || authStore.isAdmin" class="col-12 col-sm-6 col-md-3">
        <q-card
          clickable
          v-ripple
          class="cursor-pointer bg-positive text-white"
          @click="$router.push('/delivery/create')"
        >
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">สร้างใบส่งเอกสาร</div>
              <div class="text-caption opacity-80">บันทึกส่งเอกสารใหม่</div>
            </div>
            <q-icon name="post_add" size="36px" />
          </q-card-section>
        </q-card>
      </div>

      <div v-if="authStore.isStaff || authStore.isAdmin" class="col-12 col-sm-6 col-md-3">
        <q-card
          clickable
          v-ripple
          class="cursor-pointer bg-primary text-white"
          @click="$router.push('/receiving')"
        >
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">รายการรอรับ</div>
              <div class="text-caption opacity-80">
                {{ notificationStore.pendingCount }} รายการค้างรับ
              </div>
            </div>
            <q-icon name="inbox" size="36px" />
          </q-card-section>
        </q-card>
      </div>

      <div v-if="authStore.isStaff || authStore.isAdmin" class="col-12 col-sm-6 col-md-3">
        <q-card
          clickable
          v-ripple
          class="cursor-pointer bg-info text-white"
          @click="$router.push('/delivery')"
        >
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">ใบส่งของฉัน</div>
              <div class="text-caption opacity-80">ดูประวัติการส่ง</div>
            </div>
            <q-icon name="outbox" size="36px" />
          </q-card-section>
        </q-card>
      </div>

      <div v-if="authStore.isManagerOrAdmin" class="col-12 col-sm-6 col-md-3">
        <q-card
          clickable
          v-ripple
          class="cursor-pointer bg-purple text-white"
          @click="$router.push('/reports')"
        >
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">รายงานสรุป</div>
              <div class="text-caption opacity-80">Export & Summary</div>
            </div>
            <q-icon name="assessment" size="36px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Overview Card -->
    <q-card flat bordered>
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">ภาพรวมระบบ</div>
        <q-btn flat color="primary" label="ดูทั้งหมด" to="/delivery" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <EmptyState
          title="พร้อมสำหรับการใช้งาน"
          description="เลือกเมนู 'สร้างใบส่งเอกสาร' เพื่อเริ่มต้นบันทึกการส่งเอกสาร"
          icon="description"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { USER_ROLE_CONFIG, UserRole } from "@/types/enums";
import EmptyState from "@/shared/components/EmptyState.vue";

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const roleConfig = computed(() => {
  if (!authStore.role) return { label: "", color: "grey" };
  return USER_ROLE_CONFIG[authStore.role as UserRole] || { label: authStore.role, color: "grey" };
});
</script>

<style scoped>
.opacity-80 {
  opacity: 0.8;
}
</style>
