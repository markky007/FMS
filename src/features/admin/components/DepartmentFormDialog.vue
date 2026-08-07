<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="min-width: 360px; max-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ isEdit ? "แก้ไขสาขา / แผนก" : "เพิ่มสาขา / แผนกใหม่" }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.code"
            label="รหัสสาขา/แผนก (Code)"
            hint="เช่น K4, HR, FIN"
            outlined
            dense
            autofocus
            :rules="[(val) => !!val || 'กรุณากรอกรหัส']"
          />

          <q-input
            v-model="form.name"
            label="ชื่อสาขา/แผนก (Name)"
            hint="เช่น สาขา K4, แผนกบัญชี"
            outlined
            dense
            :rules="[(val) => !!val || 'กรุณากรอกชื่อ']"
          />

          <q-select
            v-model="form.type"
            label="ประเภท (Type)"
            :options="typeOptions"
            map-options
            emit-value
            outlined
            dense
          />

          <q-select
            v-if="form.type === DepartmentType.DEPARTMENT"
            v-model="form.parent_id"
            label="สังกัดสาขา (Parent Branch)"
            :options="branchOptions"
            map-options
            emit-value
            outlined
            dense
            clearable
          />

          <q-input
            v-model.number="form.sort_order"
            type="number"
            label="ลำดับการแสดงผล (Sort Order)"
            outlined
            dense
          />

          <q-toggle
            v-model="form.is_active"
            label="เปิดใช้งาน (Active)"
            color="positive"
          />

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="ยกเลิก" color="grey-7" v-close-popup />
            <q-btn
              type="submit"
              :label="isEdit ? 'บันทึก' : 'เพิ่ม'"
              color="primary"
              unelevated
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDialogPluginComponent } from "quasar";
import { DepartmentType } from "@/types/enums";
import type { Department } from "@/types/models";
import type { DepartmentFormInput } from "../composables/useDepartmentManagement";

const props = defineProps<{
  department?: Department | null;
  branches: Department[];
  loading?: boolean;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const isEdit = computed(() => !!props.department);

const form = ref<DepartmentFormInput>({
  code: props.department?.code || "",
  name: props.department?.name || "",
  type: props.department?.type || DepartmentType.BRANCH,
  parent_id: props.department?.parent_id || null,
  sort_order: props.department?.sort_order ?? 0,
  is_active: props.department?.is_active ?? true,
});

const typeOptions = [
  { label: "สาขา (Branch)", value: DepartmentType.BRANCH },
  { label: "แผนก (Department)", value: DepartmentType.DEPARTMENT },
];

const branchOptions = computed(() =>
  props.branches.map((b) => ({
    label: `${b.code} - ${b.name}`,
    value: b.id,
  })),
);

function handleSubmit() {
  onDialogOK(form.value);
}
</script>
