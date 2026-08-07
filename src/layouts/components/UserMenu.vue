<template>
  <div class="user-menu-wrapper">
    <div
      class="user-card-pill cursor-pointer row items-center no-wrap q-px-sm q-py-xs"
    >
      <q-avatar size="32px" class="user-avatar text-weight-bold">
        {{ avatarText }}
      </q-avatar>

      <div class="user-info-text q-ml-sm q-mr-xs gt-xs">
        <div
          class="user-name text-weight-bold text-caption text-white line-height-tight"
        >
          {{ authStore.fullName || "ผู้ใช้งาน" }}
        </div>
        <div class="user-role text-caption text-blue-2 line-height-tight">
          {{ roleLabel }}
        </div>
      </div>

      <q-icon name="expand_more" size="18px" class="text-blue-2 q-ml-xs" />

      <q-menu auto-close class="user-dropdown-menu" :offset="[0, 8]">
        <q-list style="min-width: 230px">
          <q-item class="bg-slate-50 q-py-md">
            <q-item-section avatar>
              <q-avatar size="42px" class="user-avatar text-weight-bold">
                {{ avatarText }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-subtitle2">
                {{ authStore.fullName || "ผู้ใช้งาน" }}
              </q-item-label>
              <q-item-label caption class="text-grey-7">
                {{ roleLabel }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable v-ripple to="/profile" class="q-py-sm">
            <q-item-section avatar style="min-width: 32px">
              <q-icon name="person_outline" color="primary" size="20px" />
            </q-item-section>
            <q-item-section>โปรไฟล์ / เปลี่ยนรหัสผ่าน</q-item-section>
          </q-item>

          <q-separator />

          <q-item
            clickable
            v-ripple
            @click="handleLogout"
            class="text-negative q-py-sm"
          >
            <q-item-section avatar style="min-width: 32px">
              <q-icon name="logout" color="negative" size="20px" />
            </q-item-section>
            <q-item-section class="text-weight-medium"
              >ออกจากระบบ</q-item-section
            >
          </q-item>
        </q-list>
      </q-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLE_CONFIG, UserRole } from "@/types/enums";

const authStore = useAuthStore();
const router = useRouter();

const avatarText = computed(() => {
  const name = authStore.fullName;
  return name ? name.charAt(0).toUpperCase() : "U";
});

const roleLabel = computed(() => {
  if (!authStore.role) return "";
  return USER_ROLE_CONFIG[authStore.role as UserRole]?.label || authStore.role;
});

async function handleLogout() {
  await authStore.logout();
  await router.push("/login");
}
</script>

<style scoped lang="scss">
.user-card-pill {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  transition: all 150ms ease;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.35);
  }
}

.user-avatar {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.line-height-tight {
  line-height: 1.25;
}

.user-name {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  opacity: 0.9;
}
</style>
