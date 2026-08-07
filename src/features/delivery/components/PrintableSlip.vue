<template>
  <div class="printable-slip-wrapper bg-white text-black q-pa-md">
    <!-- Header Title -->
    <div class="text-h6 text-weight-bold text-center text-uppercase q-mb-sm text-underline">
      KCST : COVER LIST OF DOCUMENT & ETC. DELIVERY
    </div>

    <!-- Header Metadata Line -->
    <div class="row items-center justify-between text-body1 text-weight-bold q-mb-md border-bottom pb-xs">
      <div>From : <span class="value-text">{{ slip?.from_department?.code || "-" }}</span></div>
      <div>To : <span class="value-text">{{ slip?.to_department?.code || "-" }}</span></div>
      <div>Delivery by : <span class="value-text">{{ slip?.delivered_by_name || "-" }}</span></div>
      <div>Time : <span class="value-text">{{ slip?.send_time || "-" }}</span></div>
      <div>Date : <span class="value-text">{{ formatDateThai(slip?.send_date, 'medium') }}</span></div>
    </div>

    <!-- Excel-Exact Main Table -->
    <table class="kcst-table full-width">
      <thead>
        <tr>
          <th style="width: 8%">Item No.</th>
          <th style="width: 22%">Receiver's name</th>
          <th style="width: 20%">Sender's name</th>
          <th style="width: 8%">QTY.</th>
          <th style="width: 42%">Sign for receive ( PIC.in destination )</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in displayItems" :key="idx">
          <td class="text-center">{{ item ? item.item_number : idx + 1 }}</td>
          <td>{{ item ? item.receiver_name : '' }}</td>
          <td>{{ item ? item.sender_name : '' }}</td>
          <td class="text-center">{{ item ? item.quantity : '' }}</td>
          <td>
            <template v-if="item">
              <div class="row items-center justify-between">
                <span>{{ item.document_description }}</span>
                <div v-if="item.is_received" class="signature-box">
                  <img
                    v-if="item.signature_url"
                    :src="item.signature_url"
                    alt="Signature"
                    style="max-height: 36px"
                  />
                  <span v-else class="text-caption text-positive">✓ เซ็นรับแล้ว</span>
                </div>
              </div>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Footer Signature Lines -->
    <div class="row justify-between items-end q-mt-xl pt-lg">
      <div class="column items-center">
        <div class="signature-line">
          <span class="text-weight-bold">{{ senderSignerName }}</span>
        </div>
        <div class="text-body2 text-grey-8">(Sender's name)</div>
      </div>

      <div class="column items-center">
        <div class="signature-line">
          <span v-if="receiverSignerName" class="text-weight-bold">
            {{ receiverSignerName }}
          </span>
        </div>
        <div class="text-body2 text-grey-8">(Receiver's name)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateThai } from "@/shared/utils/date";
import type { DeliverySlip, DeliveryItem } from "@/types/models";

export interface ItemWithSig extends DeliveryItem {
  signature_url?: string;
}

const props = withDefaults(
  defineProps<{
    slip?: DeliverySlip | null | undefined;
    items?: ItemWithSig[] | undefined;
    minRows?: number;
  }>(),
  {
    slip: null,
    items: () => [],
    minRows: 10,
  },
);

const displayItems = computed(() => {
  const current = props.items || [];
  const result: (ItemWithSig | null)[] = [...current];
  while (result.length < props.minRows) {
    result.push(null);
  }
  return result;
});

const senderSignerName = computed(() => {
  return props.slip?.delivered_by_name || props.slip?.creator?.full_name || "sasinan";
});

const receiverSignerName = computed(() => {
  const receivedItem = (props.items || []).find((i) => i.is_received && i.signature);
  if (receivedItem?.signature) {
    return receivedItem.signature.signer_name;
  }
  return "";
});
</script>

<style scoped lang="scss">
.printable-slip-wrapper {
  max-width: 900px;
  margin: 0 auto;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  color: #000;
}

.text-underline {
  text-decoration: underline;
}

.border-bottom {
  border-bottom: 2px solid #000;
}

.pb-xs {
  padding-bottom: 8px;
}

.value-text {
  border-bottom: 1px solid #000;
  padding: 0 8px;
}

/* Excel-Exact Table Styling */
.kcst-table {
  border-collapse: collapse;
  width: 100%;

  th,
  td {
    border: 1.5px solid #000;
    padding: 6px 8px;
    font-size: 13px;
    height: 32px;
  }

  th {
    background-color: #d9d9d9;
    font-weight: bold;
    text-align: center;
  }
}

.signature-line {
  min-width: 220px;
  border-bottom: 1.5px solid #000;
  text-align: center;
  padding-bottom: 2px;
  min-height: 24px;
}

@media print {
  .printable-slip-wrapper {
    max-width: 100%;
    padding: 0;
  }
  .kcst-table th {
    background-color: #d9d9d9 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
