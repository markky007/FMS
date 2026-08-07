<template>
  <q-card flat bordered class="bg-white">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold text-primary row items-center justify-between">
        <div class="row items-center">
          <q-icon name="pie_chart" class="q-mr-xs" size="22px" />
          สัดส่วนการส่งเอกสารแยกตามสาขา (ต้นทาง)
        </div>
        <q-chip size="sm" color="blue-1" text-color="primary">
          รวม {{ totalCount }} รายการ
        </q-chip>
      </div>

      <div v-if="breakdown.length > 0" class="q-mt-md q-gutter-y-md">
        <div v-for="item in breakdown" :key="item.department_id">
          <div class="row justify-between items-center text-body2 q-mb-xs">
            <span class="text-weight-bold">
              {{ item.department_code }} - {{ item.department_name }}
            </span>
            <span class="text-caption text-grey-7">
              {{ item.count }} รายการ ({{ getPercentage(item.count) }}%)
            </span>
          </div>
          <q-linear-progress
            :value="item.count / (totalCount || 1)"
            color="primary"
            track-color="grey-3"
            size="10px"
            rounded
          />
        </div>
      </div>

      <EmptyState
        v-else
        title="ยังไม่มีสถิติสาขา"
        description="เมื่อมีการส่งเอกสาร สถิติตามสาขาจะถูกคำนวณและแสดงที่นี่"
        icon="equalizer"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import EmptyState from "@/shared/components/EmptyState.vue";
import type { DepartmentBreakdown } from "@/types/models";

const props = defineProps<{
  breakdown: DepartmentBreakdown[];
}>();

const totalCount = computed(() =>
  props.breakdown.reduce((sum, item) => sum + item.count, 0),
);

function getPercentage(count: number): number {
  if (!totalCount.value) return 0;
  return Math.round((count / totalCount.value) * 100);
}
</script>
