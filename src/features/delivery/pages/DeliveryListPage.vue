<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">ใบส่งของฉัน</div>
        <div class="text-caption text-grey-7">
          ประวัติและสถานะใบส่งเอกสารที่คุณสร้างหรือส่งมายังแผนกคุณ
        </div>
      </div>
      <q-btn
        color="positive"
        icon="add"
        label="สร้างใบส่งเอกสาร"
        to="/delivery/create"
        unelevated
      />
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md bg-white">
      <q-card-section class="row items-center q-col-gutter-sm">
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="filters.status"
            :options="statusOptions"
            label="สถานะใบส่ง"
            dense
            outlined
            emit-value
            map-options
            clearable
            @update:model-value="onFilterChange"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="filters.from_department_id"
            :options="departmentOptions"
            label="จาก (ต้นทาง)"
            dense
            outlined
            emit-value
            map-options
            clearable
            @update:model-value="onFilterChange"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="filters.to_department_id"
            :options="departmentOptions"
            label="ถึง (ปลายทาง)"
            dense
            outlined
            emit-value
            map-options
            clearable
            @update:model-value="onFilterChange"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3 text-right">
          <q-btn
            flat
            icon="refresh"
            label="รีเฟรช"
            color="primary"
            :loading="slipStore.isLoading"
            @click="onFilterChange"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Slips List View (Adaptive) -->
    <div v-if="slipStore.mySlips.length > 0">
      <SlipListView
        :slips="slipStore.mySlips"
        :loading="slipStore.isLoading"
        @select="onSelectSlip"
      />
    </div>

    <q-card v-else-if="!slipStore.isLoading" flat bordered>
      <q-card-section>
        <EmptyState
          title="ยังไม่มีใบส่งเอกสาร"
          description="กดปุ่ม 'สร้างใบส่งเอกสาร' เพื่อเริ่มต้นสร้างและส่งเอกสาร"
          icon="outbox"
        >
          <template #action>
            <q-btn
              color="primary"
              label="สร้างใบส่งเอกสารใหม่"
              to="/delivery/create"
              unelevated
            />
          </template>
        </EmptyState>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDeliverySlipStore } from "@/stores/delivery-slip.store";
import { useDepartmentStore } from "@/stores/department.store";
import { useRealtimeSubscription } from "@/shared/composables/useRealtimeSubscription";
import SlipListView from "../components/SlipListView.vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import { SlipStatus, SLIP_STATUS_CONFIG } from "@/types/enums";
import type { DeliverySlip, SlipFilters } from "@/types/models";

const router = useRouter();
const slipStore = useDeliverySlipStore();
const departmentStore = useDepartmentStore();

useRealtimeSubscription({
  onSlipChange: () => {
    void onFilterChange();
  },
});

const filters = ref({
  status: undefined as SlipStatus | undefined,
  from_department_id: undefined as string | undefined,
  to_department_id: undefined as string | undefined,
});

const statusOptions = Object.values(SlipStatus).map((s) => ({
  label: SLIP_STATUS_CONFIG[s]?.label || s,
  value: s,
}));

const departmentOptions = computed(() =>
  departmentStore.departments.map((d) => ({
    label: `${d.code} - ${d.name}`,
    value: d.id,
  })),
);

async function onFilterChange() {
  const payload: SlipFilters = {};
  if (filters.value.status) payload.status = filters.value.status;
  if (filters.value.from_department_id) payload.from_department_id = filters.value.from_department_id;
  if (filters.value.to_department_id) payload.to_department_id = filters.value.to_department_id;

  await slipStore.fetchMySlips(payload);
}

function onSelectSlip(slip: DeliverySlip) {
  router.push(`/delivery/${slip.id}`);
}

onMounted(async () => {
  await Promise.all([
    departmentStore.fetchAll(),
    slipStore.fetchMySlips(),
  ]);
});
</script>
