<template>
  <div class="q-gutter-y-md">
    <!-- Header Section Card -->
    <q-card flat bordered class="bg-white">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold text-primary q-mb-md row items-center">
          <q-icon name="description" class="q-mr-xs" size="24px" />
          สร้างใบส่งเอกสาร (Cover List of Document Delivery)
        </div>

        <q-form class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="headerForm.from_department_id"
              label="From : ต้นทาง *"
              :options="departmentOptions"
              emit-value
              map-options
              outlined
              dense
              :disabled="!!activeSlipId"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="headerForm.to_department_id"
              label="To : ปลายทาง *"
              :options="departmentOptions"
              emit-value
              map-options
              outlined
              dense
              :disabled="!!activeSlipId"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model="headerForm.delivered_by_name"
              label="Delivery by : ผู้จัดส่ง *"
              outlined
              dense
              :disabled="!!activeSlipId"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model="headerForm.send_date"
              type="date"
              label="Date : วันที่ส่ง *"
              outlined
              dense
              :disabled="!!activeSlipId"
            />
          </div>
        </q-form>

        <div v-if="!activeSlipId" class="row justify-end q-mt-sm">
          <q-btn
            color="primary"
            icon="play_arrow"
            label="เริ่มต้นกรอกรายการเอกสาร"
            unelevated
            :disabled="!canCreateHeader"
            :loading="isSubmitting"
            @click="initSlipHeader"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Items Section Card (Enabled once header created) -->
    <template v-if="activeSlipId">
      <ItemForm
        :next-item-number="items.length + 1"
        :loading="isItemLoading"
        @add-item="handleAddItem"
      />

      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            รายการเอกสารทั้งหมดในใบส่งนี้ ({{ items.length }} รายการ)
          </div>
          <ItemList
            :items="items"
            editable
            @delete-item="handleDeleteItem"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn
            flat
            label="บันทึกแบบร่าง"
            color="grey-8"
            @click="finishDraft"
          />
          <q-btn
            color="positive"
            icon="send"
            label="ยืนยันส่งเอกสาร"
            unelevated
            size="lg"
            :disabled="items.length === 0"
            @click="finishAndSend"
          />
        </q-card-actions>
      </q-card>
    </template>
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
const { createSlip, sendSlip, isSubmitting } = useDeliverySlip();
const { addItem, deleteItem, isItemLoading } = useDeliveryItems();

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

const canCreateHeader = computed(
  () =>
    !!headerForm.value.from_department_id &&
    !!headerForm.value.to_department_id &&
    headerForm.value.from_department_id !== headerForm.value.to_department_id,
);

async function initSlipHeader() {
  const id = await createSlip({
    from_department_id: headerForm.value.from_department_id,
    to_department_id: headerForm.value.to_department_id,
    delivered_by_name: headerForm.value.delivered_by_name,
    send_date: headerForm.value.send_date,
    send_time: headerForm.value.send_time,
  });
  if (id) {
    activeSlipId.value = id;
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
