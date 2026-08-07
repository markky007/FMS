<template>
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">จัดการสาขา / แผนก</div>
        <div class="text-caption text-grey-7">
          กำหนดรายชื่อสาขาและแผนกสำหรับต้นทาง-ปลายทางใบส่งเอกสาร
        </div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="เพิ่มสาขา / แผนก"
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
            placeholder="ค้นหารหัส หรือชื่อสาขา..."
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
            v-model="typeFilter"
            :options="typeFilterOptions"
            label="ประเภท"
            dense
            outlined
            emit-value
            map-options
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Content Table / Card List -->
    <q-card flat bordered>
      <q-table
        :rows="filteredDepartments"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        flat
        :pagination="{ rowsPerPage: 20 }"
      >
        <template #body-cell-code="props">
          <q-td :props="props">
            <q-chip
              dense
              color="blue-1"
              text-color="primary"
              class="text-weight-bold"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-type="props">
          <q-td :props="props">
            <q-badge
              :color="props.value === DepartmentType.BRANCH ? 'purple' : 'teal'"
              multi-line
            >
              {{ props.value === DepartmentType.BRANCH ? "สาขา" : "แผนก" }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-is_active="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'positive' : 'grey'">
              {{ props.value ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
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
              <q-tooltip>แก้ไข</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              :icon="props.row.is_active ? 'visibility_off' : 'visibility'"
              :color="props.row.is_active ? 'warning' : 'positive'"
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>
                {{ props.row.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน" }}
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
import {
  useDepartmentManagement,
  type DepartmentFormInput
} from "../composables/useDepartmentManagement";
import DepartmentFormDialog from "../components/DepartmentFormDialog.vue";
import { DepartmentType } from "@/types/enums";
import type { Department } from "@/types/models";

const $q = useQuasar();
const {
  allDepartments,
  isLoading,
  fetchAllDepartments,
  createDepartment,
  updateDepartment,
  toggleStatus
} = useDepartmentManagement();

const search = ref("");
const typeFilter = ref<string | null>(null);

const typeFilterOptions = [
  { label: "ทั้งหมด", value: null },
  { label: "สาขา (Branch)", value: DepartmentType.BRANCH },
  { label: "แผนก (Department)", value: DepartmentType.DEPARTMENT }
];

const branches = computed(() =>
  allDepartments.value.filter(d => d.type === DepartmentType.BRANCH)
);

const filteredDepartments = computed(() => {
  let list = allDepartments.value;
  if (typeFilter.value) {
    list = list.filter(d => d.type === typeFilter.value);
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim();
    list = list.filter(
      d => d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
    );
  }
  return list;
});

const columns = [
  {
    name: "code",
    label: "รหัส",
    field: "code",
    sortable: true,
    align: "left" as const
  },
  {
    name: "name",
    label: "ชื่อสาขา/แผนก",
    field: "name",
    sortable: true,
    align: "left" as const
  },
  {
    name: "type",
    label: "ประเภท",
    field: "type",
    sortable: true,
    align: "center" as const
  },
  {
    name: "sort_order",
    label: "ลำดับ",
    field: "sort_order",
    sortable: true,
    align: "center" as const
  },
  {
    name: "is_active",
    label: "สถานะ",
    field: "is_active",
    sortable: true,
    align: "center" as const
  },
  {
    name: "actions",
    label: "จัดการ",
    field: "actions",
    align: "right" as const
  }
];

function openCreateDialog() {
  $q.dialog({
    component: DepartmentFormDialog,
    componentProps: {
      branches: branches.value
    }
  }).onOk(async (data: DepartmentFormInput) => {
    await createDepartment(data);
  });
}

function openEditDialog(dept: Department) {
  $q.dialog({
    component: DepartmentFormDialog,
    componentProps: {
      department: dept,
      branches: branches.value
    }
  }).onOk(async (data: DepartmentFormInput) => {
    await updateDepartment(dept.id, data);
  });
}

onMounted(async () => {
  await fetchAllDepartments();
});
</script>
