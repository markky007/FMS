<template>
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">จัดการผู้ใช้งาน</div>
        <div class="text-caption text-grey-7">
          สร้างบัญชีผู้ใช้งานใหม่ กำหนดสิทธิ์ และระงับ/เปิดใช้งานบัญชี
        </div>
      </div>
      <q-btn
        color="primary"
        icon="person_add"
        label="เพิ่มผู้ใช้งานใหม่"
        unelevated
        @click="openCreateDialog"
      />
    </div>

    <!-- Filter Bar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row items-center q-col-gutter-sm">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="search"
            placeholder="ค้นหาชื่อ หรืออีเมลผู้ใช้..."
            dense
            outlined
            clearable
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="roleFilter"
            :options="roleFilterOptions"
            label="สิทธิ์การใช้งาน (Role)"
            dense
            outlined
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="departmentFilter"
            :options="departmentFilterOptions"
            label="สาขา / แผนก"
            dense
            outlined
            emit-value
            map-options
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Users Table -->
    <q-card flat bordered>
      <q-table
        :rows="filteredUsers"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        flat
        :pagination="{ rowsPerPage: 20 }"
      >
        <template #body-cell-full_name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="32px" color="primary" text-color="white" class="q-mr-sm">
                {{ props.row.full_name ? props.row.full_name.charAt(0) : "U" }}
              </q-avatar>
              <div>
                <div class="text-weight-bold">{{ props.value }}</div>
                <div class="text-caption text-grey-6">{{ props.row.email }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-role="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="getRoleConfig(props.value).color"
              text-color="white"
              class="text-weight-medium"
            >
              {{ getRoleConfig(props.value).label }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-department="props">
          <q-td :props="props">
            <span v-if="props.row.department" class="text-weight-medium text-grey-9">
              {{ props.row.department.code }} - {{ props.row.department.name }}
            </span>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>

        <template #body-cell-is_active="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'positive' : 'grey'">
              {{ props.value ? 'ปกติ' : 'ถูกระงับ' }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip>แก้ไขข้อมูล</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              :icon="props.row.is_active ? 'block' : 'check_circle'"
              :color="props.row.is_active ? 'negative' : 'positive'"
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>
                {{ props.row.is_active ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี' }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useUserManagement, type UserFormInput } from "../composables/useUserManagement";
import { useDepartmentStore } from "@/stores/department.store";
import UserFormDialog from "../components/UserFormDialog.vue";
import { UserRole, USER_ROLE_CONFIG } from "@/types/enums";
import type { Profile } from "@/types/models";

const $q = useQuasar();
const departmentStore = useDepartmentStore();
const {
  allUsers,
  isLoading,
  fetchAllUsers,
  createUser,
  updateUser,
  toggleStatus,
} = useUserManagement();

const search = ref("");
const roleFilter = ref<string | null>(null);
const departmentFilter = ref<string | null>(null);

const roleFilterOptions = [
  { label: "ทั้งหมด", value: null },
  { label: USER_ROLE_CONFIG[UserRole.STAFF].label, value: UserRole.STAFF },
  { label: USER_ROLE_CONFIG[UserRole.MANAGER].label, value: UserRole.MANAGER },
  { label: USER_ROLE_CONFIG[UserRole.ADMIN].label, value: UserRole.ADMIN },
];

const departmentFilterOptions = computed(() => [
  { label: "ทั้งหมด", value: null },
  ...departmentStore.departments.map((d) => ({
    label: `${d.code} - ${d.name}`,
    value: d.id,
  })),
]);

const filteredUsers = computed(() => {
  let list = allUsers.value;
  if (roleFilter.value) {
    list = list.filter((u) => u.role === roleFilter.value);
  }
  if (departmentFilter.value) {
    list = list.filter((u) => u.department_id === departmentFilter.value);
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim();
    list = list.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }
  return list;
});

const columns = [
  { name: "full_name", label: "ชื่อ-นามสกุล / อีเมล", field: "full_name", sortable: true, align: "left" as const },
  { name: "role", label: "สิทธิ์การใช้งาน", field: "role", sortable: true, align: "center" as const },
  { name: "department", label: "สาขา / แผนก", field: "department", sortable: true, align: "left" as const },
  { name: "is_active", label: "สถานะ", field: "is_active", sortable: true, align: "center" as const },
  { name: "actions", label: "จัดการ", field: "actions", align: "right" as const },
];

function getRoleConfig(role: UserRole) {
  return USER_ROLE_CONFIG[role] || { label: role, color: "grey" };
}

function openCreateDialog() {
  $q.dialog({
    component: UserFormDialog,
    componentProps: {
      departments: departmentStore.departments,
    },
  }).onOk(async (data: UserFormInput) => {
    await createUser(data);
  });
}

function openEditDialog(user: Profile) {
  $q.dialog({
    component: UserFormDialog,
    componentProps: {
      user,
      departments: departmentStore.departments,
    },
  }).onOk(async (data: UserFormInput) => {
    await updateUser(user.id, data);
  });
}

onMounted(async () => {
  await Promise.all([
    fetchAllUsers(),
    departmentStore.fetchAll(),
  ]);
});
</script>
