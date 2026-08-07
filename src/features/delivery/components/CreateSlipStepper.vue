<template>
  <div>
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
      flat
      bordered
      class="rounded-borders"
    >
      <!-- Step 1: Slip Header Info -->
      <q-step
        :name="1"
        title="ข้อมูลใบส่งเอกสาร (Header)"
        caption="ระบุต้นทาง-ปลายทาง และผู้จัดส่ง"
        icon="description"
        :done="step > 1"
      >
        <q-form class="q-gutter-md">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-select
                v-model="headerForm.from_department_id"
                label="จาก (From Branch) *"
                :options="departmentOptions"
                emit-value
                map-options
                outlined
                dense
                :rules="[(val) => !!val || 'กรุณาเลือกสาขาต้นทาง']"
              />
            </div>

            <div class="col-6">
              <q-select
                v-model="headerForm.to_department_id"
                label="ถึง (To Branch) *"
                :options="departmentOptions"
                emit-value
                map-options
                outlined
                dense
                :rules="[(val) => !!val || 'กรุณาเลือกสาขาปลายทาง']"
              />
            </div>
          </div>

          <q-input
            v-model="headerForm.delivered_by_name"
            label="Delivery by (ชื่อผู้จัดส่ง) *"
            hint="พิมพ์ชื่อพนักงานจัดส่ง หรือผู้นำส่ง"
            outlined
            dense
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="headerForm.send_date"
                type="date"
                label="วันที่ส่ง (Date) *"
                outlined
                dense
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="headerForm.send_time"
                type="time"
                label="เวลาส่ง (Time)"
                outlined
                dense
              />
            </div>
          </div>

          <q-stepper-navigation>
            <q-btn
              color="primary"
              label="ถัดไป (เพิ่มรายการเอกสาร) →"
              unelevated
              :disabled="!canProceedStep1"
              @click="createDraftHeader"
            />
          </q-stepper-navigation>
        </q-form>
      </q-step>

      <!-- Step 2: Delivery Items Entry -->
      <q-step
        :name="2"
        title="รายการเอกสาร (Items)"
        caption="เพิ่มรายการเอกสารในใบส่งนี้"
        icon="playlist_add"
        :done="items.length > 0"
      >
        <ItemForm
          :next-item-number="items.length + 1"
          :loading="isItemLoading"
          class="q-mb-md"
          @add-item="handleAddItem"
        />

        <ItemList
          :items="items"
          editable
          @delete-item="handleDeleteItem"
        />

        <q-stepper-navigation class="row justify-between items-center q-mt-md">
          <q-btn flat label="← ย้อนกลับ" color="grey-7" @click="step = 1" />
          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="grey-8"
              label="บันทึกแบบร่าง"
              @click="finishDraft"
            />
            <q-btn
              color="positive"
              icon="send"
              label="ส่งเอกสารเลย"
              unelevated
              :disabled="items.length === 0"
              @click="finishAndSend"
            />
          </div>
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDepartmentStore } from "@/stores/department.store";
import { useAuthStore } from "@/stores/auth.store";
import { useDeliverySlip } from "../composables/useDeliverySlip";
import { useDeliveryItems } from "../composables/useDeliveryItems";
import ItemForm from "./ItemForm.vue";
import ItemList from "./ItemList.vue";
import type { DeliveryItem } from "@/types/models";

const router = useRouter();
const departmentStore = useDepartmentStore();
const authStore = useAuthStore();
const { createSlip, sendSlip } = useDeliverySlip();
const { addItem, deleteItem, isItemLoading } = useDeliveryItems();

const step = ref(1);
const activeSlipId = ref<string | null>(null);
const items = ref<DeliveryItem[]>([]);

const headerForm = ref({
  from_department_id: authStore.departmentId || "",
  to_department_id: "",
  delivered_by_name: authStore.fullName || "",
  send_date: new Date().toISOString().split("T")[0] || "",
  send_time: new Date().toTimeString().split(" ")[0]?.substring(0, 5) || "",
});

const departmentOptions = computed(() =>
  departmentStore.departments.map((d) => ({
    label: `${d.code} - ${d.name}`,
    value: d.id,
  })),
);

const canProceedStep1 = computed(
  () =>
    !!headerForm.value.from_department_id &&
    !!headerForm.value.to_department_id &&
    headerForm.value.from_department_id !== headerForm.value.to_department_id,
);

async function createDraftHeader() {
  if (!activeSlipId.value) {
    const id = await createSlip({
      from_department_id: headerForm.value.from_department_id,
      to_department_id: headerForm.value.to_department_id,
      delivered_by_name: headerForm.value.delivered_by_name,
      send_date: headerForm.value.send_date,
      send_time: headerForm.value.send_time,
    });
    if (id) {
      activeSlipId.value = id;
      step.value = 2;
    }
  } else {
    step.value = 2;
  }
}

async function handleAddItem(payload: {
  document_description: string;
  receiver_name: string;
  receiver_user_id?: string | undefined;
  sender_name: string;
  sender_user_id?: string | undefined;
  quantity: number;
  files: File[];
}) {
  if (!activeSlipId.value) return;

  const newItem = await addItem(
    {
      delivery_slip_id: activeSlipId.value,
      item_number: items.value.length + 1,
      document_description: payload.document_description,
      receiver_name: payload.receiver_name,
      receiver_user_id: payload.receiver_user_id,
      sender_name: payload.sender_name,
      sender_user_id: payload.sender_user_id,
      quantity: payload.quantity,
    },
    payload.files,
  );

  if (newItem) {
    items.value.push(newItem);
  }
}

async function handleDeleteItem(item: DeliveryItem) {
  const success = await deleteItem(item);
  if (success) {
    items.value = items.value.filter((i) => i.id !== item.id);
  }
}

async function finishDraft() {
  await router.push("/delivery");
}

async function finishAndSend() {
  if (!activeSlipId.value) return;
  const success = await sendSlip(activeSlipId.value);
  if (success) {
    await router.push("/delivery");
  }
}

onMounted(async () => {
  await departmentStore.fetchAll();
});
</script>
