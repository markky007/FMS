<template>
  <q-footer elevated class="bg-white text-grey-8 border-top">
    <q-tabs
      v-model="activeTab"
      dense
      align="justify"
      active-color="primary"
      indicator-color="primary"
      class="text-grey-7 mobile-nav-tabs"
    >
      <q-route-tab
        name="home"
        to="/home"
        icon="home"
        label="หน้าหลัก"
        exact
      />

      <q-route-tab
        v-if="authStore.isStaff || authStore.isAdmin"
        name="create"
        to="/delivery/create"
        icon="add_circle"
        label="สร้าง"
        class="text-positive text-weight-bold"
      />

      <q-route-tab
        v-if="authStore.isStaff || authStore.isAdmin"
        name="receiving"
        to="/receiving"
        icon="inbox"
        label="รอรับ"
        exact
      >
        <q-badge
          v-if="notificationStore.pendingCount > 0"
          color="negative"
          floating
          pill
        >
          {{ notificationStore.pendingCount }}
        </q-badge>
      </q-route-tab>

      <!-- Admin & Extra Menu Tab -->
      <q-tab
        name="more"
        :icon="authStore.isAdmin ? 'admin_panel_settings' : 'apps'"
        :label="authStore.isAdmin ? 'จัดการ' : 'เมนู'"
        :class="authStore.isAdmin ? 'text-primary text-weight-bold' : ''"
        @click="showMoreSheet = true"
      />

      <q-route-tab
        name="profile"
        to="/profile"
        icon="person"
        label="โปรไฟล์"
        exact
      />
    </q-tabs>

    <!-- Mobile Quick Actions & Admin Bottom Sheet -->
    <q-dialog v-model="showMoreSheet" position="bottom" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="mobile-menu-sheet">
        <div class="drag-handle-bar q-mx-auto q-my-sm" />

        <q-card-section class="q-pt-none q-pb-sm row items-center justify-between">
          <div>
            <div class="text-subtitle1 text-weight-bold text-primary row items-center">
              <q-icon
                :name="authStore.isAdmin ? 'admin_panel_settings' : 'apps'"
                size="22px"
                class="q-mr-xs text-primary"
              />
              {{ authStore.isAdmin ? 'เมนูผู้ดูแลระบบ (Admin)' : 'เมนูทั้งหมด' }}
            </div>
            <div class="text-caption text-grey-7">เลือกรายการที่ต้องการทำรายการบนมือถือ</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-sm">
            <!-- Admin Only Section -->
            <template v-if="authStore.isAdmin">
              <div class="col-6">
                <q-card flat bordered class="menu-action-card bg-blue-1 border-blue cursor-pointer" @click="navigate('/admin/users')">
                  <q-card-section class="q-pa-sm text-center">
                    <q-avatar size="38px" color="primary" text-color="white" class="q-mb-xs">
                      <q-icon name="people" size="22px" />
                    </q-avatar>
                    <div class="text-weight-bold text-caption text-primary">จัดการผู้ใช้งาน</div>
                    <div class="text-caption text-grey-7" style="font-size: 0.68rem">Admin Only</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-6">
                <q-card flat bordered class="menu-action-card bg-indigo-1 border-indigo cursor-pointer" @click="navigate('/admin/departments')">
                  <q-card-section class="q-pa-sm text-center">
                    <q-avatar size="38px" color="indigo-8" text-color="white" class="q-mb-xs">
                      <q-icon name="account_tree" size="22px" />
                    </q-avatar>
                    <div class="text-weight-bold text-caption text-indigo-9">จัดการสาขา/แผนก</div>
                    <div class="text-caption text-grey-7" style="font-size: 0.68rem">Admin Only</div>
                  </q-card-section>
                </q-card>
              </div>
            </template>

            <!-- Manager & Admin Section -->
            <template v-if="authStore.isManagerOrAdmin">
              <div class="col-6">
                <q-card flat bordered class="menu-action-card bg-amber-1 border-amber cursor-pointer" @click="navigate('/reports')">
                  <q-card-section class="q-pa-sm text-center">
                    <q-avatar size="38px" color="amber-9" text-color="white" class="q-mb-xs">
                      <q-icon name="assessment" size="22px" />
                    </q-avatar>
                    <div class="text-weight-bold text-caption text-amber-10">รายงานสรุป</div>
                    <div class="text-caption text-grey-7" style="font-size: 0.68rem">รายงานและการวิเคราะห์</div>
                  </q-card-section>
                </q-card>
              </div>
            </template>

            <!-- General Operations Section -->
            <div class="col-6">
              <q-card flat bordered class="menu-action-card bg-teal-1 border-teal cursor-pointer" @click="navigate('/delivery')">
                <q-card-section class="q-pa-sm text-center">
                  <q-avatar size="38px" color="teal-8" text-color="white" class="q-mb-xs">
                    <q-icon name="outbox" size="22px" />
                  </q-avatar>
                  <div class="text-weight-bold text-caption text-teal-10">ใบส่งของฉัน</div>
                  <div class="text-caption text-grey-7" style="font-size: 0.68rem">รายการส่งเอกสารทั้งหมด</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-6">
              <q-card flat bordered class="menu-action-card bg-emerald-1 border-emerald cursor-pointer" @click="navigate('/receiving/history')">
                <q-card-section class="q-pa-sm text-center">
                  <q-avatar size="38px" color="emerald-8" text-color="white" class="q-mb-xs" style="background-color: #059669;">
                    <q-icon name="history" size="22px" />
                  </q-avatar>
                  <div class="text-weight-bold text-caption text-emerald-9" style="color: #047857;">ประวัติการรับ</div>
                  <div class="text-caption text-grey-7" style="font-size: 0.68rem">รายการรับเอกสารเสร็จสิ้น</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-6">
              <q-card flat bordered class="menu-action-card bg-slate-1 border-slate cursor-pointer" @click="navigate('/profile')">
                <q-card-section class="q-pa-sm text-center">
                  <q-avatar size="38px" color="slate-7" text-color="white" class="q-mb-xs" style="background-color: #475569;">
                    <q-icon name="person" size="22px" />
                  </q-avatar>
                  <div class="text-weight-bold text-caption text-slate-9" style="color: #1e293b;">โปรไฟล์ / ตั้งค่า</div>
                  <div class="text-caption text-grey-7" style="font-size: 0.68rem">ข้อมูลส่วนตัวและรหัสผ่าน</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-footer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();

const activeTab = ref("home");
const showMoreSheet = ref(false);

async function navigate(path: string) {
  showMoreSheet.value = false;
  await router.push(path);
}
</script>

<style scoped lang="scss">
.border-top {
  border-top: 1px solid var(--neutral-border);
}

.mobile-menu-sheet {
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.drag-handle-bar {
  width: 36px;
  height: 4px;
  background-color: #cbd5e1;
  border-radius: 9999px;
}

.menu-action-card {
  transition: transform 150ms ease, box-shadow 150ms ease;
  border-radius: 10px;

  &:active {
    transform: scale(0.97);
  }
}

.border-blue { border-color: #bfdbfe; }
.border-indigo { border-color: #c7d2fe; }
.border-amber { border-color: #fde68a; }
.border-teal { border-color: #99f6e4; }
.border-emerald { border-color: #a7f3d0; }
.border-slate { border-color: #e2e8f0; }

.bg-emerald-1 { background-color: #ecfdf5; }
.bg-slate-1 { background-color: #f8fafc; }
</style>
