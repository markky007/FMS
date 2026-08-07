<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="min-width: 360px; max-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ isEdit ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่" }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.full_name"
            label="ชื่อ-นามสกุล (Full Name)"
            outlined
            dense
            autofocus
            :rules="[(val) => !!val || 'กรุณากรอกชื่อ-นามสกุล']"
          />

          <q-input
            v-model="form.email"
            label="อีเมล (Email)"
            type="email"
            outlined
            dense
            :disabled="isEdit"
            :rules="[(val) => !!val || 'กรุณากรอกอีเมล']"
          />

          <q-input
            v-if="!isEdit"
            v-model="form.password"
            label="รหัสผ่านเริ่มต้น (Password)"
            type="password"
            outlined
            dense
            hint="ขั้นต่ำ 8 ตัวอักษร"
            :rules="[
              (val) => !!val || 'กรุณากรอกรหัสผ่าน',
              (val) => (val && val.length >= 8) || 'รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร',
            ]"
          />

          <q-select
            v-model="form.role"
            label="สิทธิ์การใช้งาน (Role)"
            :options="roleOptions"
            map-options
            emit-value
            outlined
            dense
          />

          <q-select
            v-model="form.department_id"
            label="สาขา / แผนกที่สังกัด (Department)"
            :options="departmentOptions"
            map-options
            emit-value
            outlined
            dense
            clearable
          />

          <q-toggle
            v-model="form.is_active"
            label="สถานะเปิดใช้งาน (Active)"
            color="positive"
          />

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="ยกเลิก" color="grey-7" v-close-popup />
            <q-btn
              type="submit"
              :label="isEdit ? 'บันทึก' : 'สร้างบัญชี'"
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
import { UserRole, USER_ROLE_CONFIG } from "@/types/enums";
import type { Profile, Department } from "@/types/models";
import type { UserFormInput } from "../composables/useUserManagement";

const props = defineProps<{
  user?: Profile | null;
  departments: Department[];
  loading?: boolean;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const isEdit = computed(() => !!props.user);

const form = ref<UserFormInput>({
  email: props.user?.email || "",
  password: "",
  full_name: props.user?.full_name || "",
  role: props.user?.role || UserRole.STAFF,
  department_id: props.user?.department_id || null,
  is_active: props.user?.is_active ?? true,
});

const roleOptions = [
  { label: USER_ROLE_CONFIG[UserRole.STAFF].label, value: UserRole.STAFF },
  { label: USER_ROLE_CONFIG[UserRole.MANAGER].label, value: UserRole.MANAGER },
  { label: USER_ROLE_CONFIG[UserRole.ADMIN].label, value: UserRole.ADMIN },
];

const departmentOptions = computed(() =>
  props.departments.map((d) => ({
    label: `${d.code} - ${d.name}`,
    value: d.id,
  })),
);

function handleSubmit() {
  onDialogOK(form.value);
}
</script>
