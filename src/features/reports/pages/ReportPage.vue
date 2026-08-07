<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">รายงานสรุปการรับส่งเอกสาร</div>
        <div class="text-caption text-grey-7">
          ดูสถิติ กรองรายงานตามช่วงเวลา/สาขา และพิมพ์/Export รายงานสรุป
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          color="positive"
          icon="print"
          label="พิมพ์รายงานสรุป"
          unelevated
          @click="printDocument"
        />
        <q-btn
          flat
          icon="refresh"
          label="รีเฟรช"
          color="primary"
          :loading="isLoading"
          @click="fetchReportData()"
        />
      </div>
    </div>

    <!-- Stats Summary Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-blue-1 text-primary">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h5 text-weight-bold">{{
                stats.total_slips
              }}</div>
              <div class="text-caption">ใบส่งเอกสารทั้งหมด</div>
            </div>
            <q-icon name="description" size="36px" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-green-1 text-positive">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h5 text-weight-bold">{{
                stats.fully_received
              }}</div>
              <div class="text-caption">รับครบเรียบร้อย</div>
            </div>
            <q-icon name="check_circle" size="36px" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-orange-1 text-orange-9">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h5 text-weight-bold">{{ stats.pending }}</div>
              <div class="text-caption">รอดำเนินการ / รอกระทบ</div>
            </div>
            <q-icon name="hourglass_top" size="36px" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-red-1 text-negative">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h5 text-weight-bold">{{ stats.voided }}</div>
              <div class="text-caption">ยกเลิก (Void)</div>
            </div>
            <q-icon name="cancel" size="36px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filter Bar -->
    <q-card flat bordered class="q-mb-md bg-white">
      <q-card-section class="row items-center q-col-gutter-sm">
        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="reportFilters.date_from"
            type="date"
            label="ตั้งแต่วันที่"
            dense
            outlined
            @update:model-value="onFilterChange"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="reportFilters.date_to"
            type="date"
            label="ถึงวันที่"
            dense
            outlined
            @update:model-value="onFilterChange"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="reportFilters.status"
            :options="statusFilterOptions"
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
            v-model="reportFilters.from_department_id"
            :options="departmentOptions"
            label="สาขาต้นทาง"
            dense
            outlined
            emit-value
            map-options
            clearable
            @update:model-value="onFilterChange"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Report Table -->
    <q-card flat bordered>
      <q-table
        :rows="slips"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        flat
        :pagination="{ rowsPerPage: 20 }"
        @row-click="onRowClick"
      >
        <template #body-cell-slip_number="props">
          <q-td :props="props">
            <span class="text-weight-bold text-primary cursor-pointer">
              {{ props.value }}
            </span>
          </q-td>
        </template>

        <template #body-cell-route="props">
          <q-td :props="props">
            <span class="text-weight-medium">
              {{ props.row.from_department?.code }}
            </span>
            <q-icon
              name="arrow_forward"
              size="14px"
              color="grey-6"
              class="q-mx-xs"
            />
            <span class="text-weight-medium">
              {{ props.row.to_department?.code }}
            </span>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <StatusChip :status="props.value" dense />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn
              flat
              round
              dense
              icon="print"
              color="primary"
              @click.stop="openExportDialog(props.row)"
            >
              <q-tooltip>พิมพ์ / Export PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useReport } from "../composables/useReport";
import { useDepartmentStore } from "@/stores/department.store";
import { useDeliverySlipStore } from "@/stores/delivery-slip.store";
import StatusChip from "@/shared/components/StatusChip.vue";
import ExportDialog from "../components/ExportDialog.vue";
import { SlipStatus, SLIP_STATUS_CONFIG } from "@/types/enums";
import type { DeliverySlip } from "@/types/models";

const $q = useQuasar();
const router = useRouter();
const departmentStore = useDepartmentStore();
const slipStore = useDeliverySlipStore();

const {
  slips,
  isLoading,
  stats,
  reportFilters,
  fetchReportData,
  printDocument
} = useReport();

const statusFilterOptions = Object.values(SlipStatus).map(s => ({
  label: SLIP_STATUS_CONFIG[s]?.label || s,
  value: s
}));

const departmentOptions = computed(() =>
  departmentStore.departments.map(d => ({
    label: `${d.code} - ${d.name}`,
    value: d.id
  }))
);

const columns = [
  {
    name: "slip_number",
    label: "เลขที่ใบส่ง",
    field: "slip_number",
    sortable: true,
    align: "left" as const
  },
  {
    name: "route",
    label: "เส้นทาง (จาก → ถึง)",
    field: "route",
    align: "left" as const
  },
  {
    name: "delivered_by",
    label: "ผู้จัดส่ง (Delivery by)",
    field: (r: DeliverySlip) =>
      r.delivered_by_name || r.creator?.full_name || "-",
    sortable: true,
    align: "left" as const
  },
  {
    name: "send_date",
    label: "วันที่ส่ง",
    field: "send_date",
    sortable: true,
    align: "center" as const
  },
  {
    name: "item_count",
    label: "จำนวนรายการ",
    field: (r: DeliverySlip) => r.item_count || 0,
    sortable: true,
    align: "center" as const
  },
  {
    name: "status",
    label: "สถานะ",
    field: "status",
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

async function onFilterChange() {
  await fetchReportData();
}

function onRowClick(_evt: Event, row: DeliverySlip) {
  router.push(`/delivery/${row.id}`);
}

async function openExportDialog(slip: DeliverySlip) {
  await slipStore.fetchSlipDetail(slip.id);
  $q.dialog({
    component: ExportDialog,
    componentProps: {
      slip: slipStore.currentSlip,
      items: slipStore.currentItems
    }
  });
}

onMounted(async () => {
  await Promise.all([departmentStore.fetchAll(), fetchReportData()]);
});
</script>
