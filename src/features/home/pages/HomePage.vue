<template>
  <q-page class="q-pa-md">
    <!-- Welcome Header Banner -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-primary">
          สวัสดี, {{ authStore.fullName || "ผู้ใช้งาน" }} 👋
        </div>
        <div class="text-caption text-grey-7">
          ยินดีต้อนรับสู่ระบบติดตามการรับส่งเอกสาร (KCST Document Delivery)
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-chip :color="roleConfig.color" text-color="white" class="text-weight-bold">
          {{ roleConfig.label }}
        </q-chip>
        <q-btn
          flat
          icon="refresh"
          label="รีเฟรช"
          color="primary"
          :loading="isLoading"
          @click="refreshDashboard"
        />
      </div>
    </div>

    <!-- Metric Stat Cards Grid -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <StatCard
          title="ส่งแล้ววันนี้"
          :value="stats.today_sent"
          subtitle="ใบส่งเอกสารสร้างวันนี้"
          icon="send"
          color="primary"
          @click="$router.push('/delivery')"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatCard
          title="รายการค้างรับ"
          :value="stats.pending_count"
          subtitle="รอการเซ็นรับจากผู้รับ"
          icon="inbox"
          color="warning"
          @click="$router.push('/receiving')"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatCard
          title="เซ็นรับแล้ววันนี้"
          :value="stats.today_received"
          subtitle="รายการเอกสารที่รับเสร็จสิ้น"
          icon="check_circle"
          color="positive"
          @click="$router.push('/receiving/history')"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatCard
          title="รวมทั้งเดือนนี้"
          :value="stats.month_total"
          subtitle="ใบส่งเอกสารรวมเดือนนี้"
          icon="assessment"
          color="purple"
          @click="$router.push('/reports')"
        />
      </div>
    </div>

    <!-- Quick Action Section -->
    <div v-if="authStore.isStaff || authStore.isAdmin" class="q-mb-lg">
      <q-card flat bordered class="bg-blue-1 border-blue">
        <q-card-section class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="rocket_launch" color="primary" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle1 text-weight-bold text-primary">ทางลัดการทำรายการ</div>
              <div class="text-caption text-grey-7">เริ่มต้นสร้างใบส่งเอกสาร หรือรับเอกสารค้างรับได้ทันที</div>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              color="positive"
              icon="post_add"
              label="สร้างใบส่งเอกสาร"
              to="/delivery/create"
              unelevated
            />
            <q-btn
              color="primary"
              icon="inbox"
              label="รายการรอรับเอกสาร"
              to="/receiving"
              unelevated
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Middle Grid: Department Breakdown & Recent Activity -->
    <div class="row q-col-gutter-md">
      <!-- Department Breakdown -->
      <div class="col-12 col-md-5">
        <DepartmentBreakdownCard :breakdown="departmentBreakdown" />
      </div>

      <!-- Recent Activity Slips -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="bg-white full-height">
          <q-card-section class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold text-primary row items-center">
              <q-icon name="history" class="q-mr-xs" size="22px" />
              รายการใบส่งเอกสารล่าสุด
            </div>
            <q-btn flat color="primary" label="ดูทั้งหมด →" to="/delivery" />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div v-if="recentSlips.length > 0">
              <SlipListView
                :slips="recentSlips"
                :loading="isLoading"
                @select="(slip: DeliverySlip) => $router.push(`/delivery/${slip.id}`)"
              />
            </div>
            <EmptyState
              v-else
              title="ยังไม่มีรายการล่าสุด"
              description="กดปุ่ม 'สร้างใบส่งเอกสาร' เพื่อเริ่มต้นส่งเอกสาร"
              icon="history"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useDashboard } from "@/features/dashboard/composables/useDashboard";
import { useRealtimeSubscription } from "@/shared/composables/useRealtimeSubscription";
import StatCard from "@/features/dashboard/components/StatCard.vue";
import DepartmentBreakdownCard from "@/features/dashboard/components/DepartmentBreakdownCard.vue";
import SlipListView from "@/features/delivery/components/SlipListView.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import { USER_ROLE_CONFIG, UserRole } from "@/types/enums";
import type { DeliverySlip } from "@/types/models";

const authStore = useAuthStore();
const { stats, departmentBreakdown, recentSlips, isLoading, refreshDashboard } =
  useDashboard();

useRealtimeSubscription({
  onSlipChange: () => {
    void refreshDashboard();
  },
  onItemChange: () => {
    void refreshDashboard();
  },
});

const roleConfig = computed(() => {
  if (!authStore.role) return { label: "", color: "grey" };
  return USER_ROLE_CONFIG[authStore.role as UserRole] || { label: authStore.role, color: "grey" };
});

onMounted(async () => {
  await refreshDashboard();
});
</script>

<style scoped>
.border-blue {
  border: 1px solid #90caf9;
}
</style>
