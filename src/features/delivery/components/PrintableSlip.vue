<template>
  <div class="printable-slip-wrapper bg-white text-black">
    <!-- Formal Document Header -->
    <div class="header-section text-center q-mb-md">
      <div class="doc-org-subtitle text-weight-bold">
        KCST DOCUMENT DELIVERY SYSTEM
      </div>
      <div class="doc-title text-weight-bold">
        ใบนำส่งเอกสาร (COVER LIST OF DOCUMENT DELIVERY)
      </div>
    </div>

    <!-- Official Header Divider -->
    <div class="header-divider q-mb-md"></div>

    <!-- Info Grid Box -->
    <table class="info-grid-table full-width q-mb-md">
      <tbody>
        <tr>
          <td class="info-label" style="width: 15%">เลขที่เอกสาร:</td>
          <td class="info-value text-weight-bold" style="width: 35%">
            {{ slip?.slip_number || "-" }}
          </td>
          <td class="info-label" style="width: 15%">วันที่นำส่ง:</td>
          <td class="info-value" style="width: 35%">
            {{ formatDateThai(slip?.send_date, "full") }}
          </td>
        </tr>
        <tr>
          <td class="info-label">จากหน่วยงาน:</td>
          <td class="info-value">
            {{ formatDept(slip?.from_department) }}
          </td>
          <td class="info-label">ถึงหน่วยงาน:</td>
          <td class="info-value">
            {{ formatDept(slip?.to_department) }}
          </td>
        </tr>
        <tr>
          <td class="info-label">ผู้นำส่งเอกสาร:</td>
          <td class="info-value">
            {{ slip?.delivered_by_name || "-" }}
          </td>
          <td class="info-label">เวลานำส่ง:</td>
          <td class="info-value">
            {{ slip?.send_time ? `${slip.send_time} น.` : "-" }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Main Items Table -->
    <table class="kcst-table full-width">
      <thead>
        <tr>
          <th style="width: 7%"
            >ลำดับ<br /><span class="en-sub">(No.)</span></th
          >
          <th style="width: 20%"
            >ชื่อผู้รับปลายทาง<br /><span class="en-sub"
              >(Receiver's Name)</span
            ></th
          >
          <th style="width: 18%"
            >ชื่อผู้ส่ง<br /><span class="en-sub">(Sender's Name)</span></th
          >
          <th style="width: 7%"
            >จำนวน<br /><span class="en-sub">(QTY)</span></th
          >
          <th style="width: 48%"
            >รายการเอกสาร / ลายมือชื่อผู้รับ<br /><span class="en-sub"
              >(Sign for receive / Description)</span
            ></th
          >
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in displayItems" :key="idx">
          <td class="text-center">{{ item ? item.item_number : idx + 1 }}</td>
          <td>{{ item ? item.receiver_name : "" }}</td>
          <td>{{ item ? item.sender_name : "" }}</td>
          <td class="text-center">{{ item ? item.quantity : "" }}</td>
          <td>
            <template v-if="item">
              <div class="row items-center justify-between no-wrap">
                <span class="doc-desc">{{ item.document_description }}</span>
                <div v-if="item.is_received" class="signature-box q-ml-xs">
                  <img
                    v-if="item.signature_url"
                    :src="item.signature_url"
                    alt="Signature"
                    style="max-height: 32px; object-fit: contain"
                  />
                  <span
                    v-else
                    class="text-caption text-positive text-weight-bold"
                  >
                    ✓ เซ็นรับแล้ว
                  </span>
                </div>
              </div>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Footer Signature Lines -->
    <div class="signature-section row justify-between items-end q-mt-xl">
      <div class="signature-block column items-center">
        <div class="signature-space row items-end justify-center">
          <span class="dots-line"></span>
        </div>
        <div class="signer-name text-weight-bold q-mt-xs">
          ( {{ senderSignerName }} )
        </div>
        <div class="signer-role text-caption">( ผู้จัดส่งเอกสาร / Sender )</div>
        <div class="date-line q-mt-xs text-caption">
          วันที่ ........ / ........ / ........
        </div>
      </div>

      <div class="signature-block column items-center">
        <div class="signature-space row items-end justify-center">
          <img
            v-if="receiverSignatureUrl"
            :src="receiverSignatureUrl"
            alt="Receiver Signature"
            class="digital-sig-img"
          />
          <span v-else class="dots-line"></span>
        </div>
        <div class="signer-name text-weight-bold q-mt-xs">
          (
          {{
            receiverSignerName ||
            "...................................................."
          }}
          )
        </div>
        <div class="signer-role text-caption">( ผู้รับเอกสาร / Receiver )</div>
        <div class="date-line q-mt-xs text-caption">
          วันที่ ........ / ........ / ........
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDateThai } from "@/shared/utils/date";
import type { DeliverySlip, DeliveryItem, Department } from "@/types/models";

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
    minRows: 10
  }
);

const displayItems = computed(() => {
  const current = props.items || [];
  const result: (ItemWithSig | null)[] = [...current];
  while (result.length < props.minRows) {
    result.push(null);
  }
  return result;
});

function formatDept(dept?: Department | null): string {
  if (!dept) return "-";
  if (dept.code && dept.name) return `${dept.code} - ${dept.name}`;
  return dept.code || dept.name || "-";
}

const senderSignerName = computed(() => {
  return (
    props.slip?.delivered_by_name ||
    props.slip?.creator?.full_name ||
    "...................................................."
  );
});

const receiverSignerName = computed(() => {
  const receivedItem = (props.items || []).find(
    i => i.is_received && i.signature
  );
  if (receivedItem?.signature) {
    return receivedItem.signature.signer_name;
  }
  return "";
});

const receiverSignatureUrl = computed(() => {
  const receivedItem = (props.items || []).find(
    i => i.is_received && (i.signature_url || i.signature?.signed_url)
  );
  if (receivedItem) {
    return (
      receivedItem.signature_url || receivedItem.signature?.signed_url || ""
    );
  }
  return "";
});
</script>

<style scoped lang="scss">
.printable-slip-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: "TH Sarabun New", "TH Sarabun PSK", "Sarabun", sans-serif;
  font-size: 16px;
  line-height: 1.35;
  color: #000;
  background-color: #fff;
}

.doc-org-subtitle {
  font-size: 14px;
  letter-spacing: 1px;
  color: #444;
  text-transform: uppercase;
}

.doc-title {
  font-size: 22px;
  line-height: 1.2;
  margin-top: 4px;
}

.header-divider {
  border-top: 3px double #000;
}

/* Info Grid Box Styling */
.info-grid-table {
  border-collapse: collapse;
  border: 1px solid #000;

  td {
    padding: 6px 10px;
    border: 1px solid #666;
    font-size: 15px;
  }

  .info-label {
    background-color: #f5f5f5;
    font-weight: bold;
    color: #222;
  }

  .info-value {
    background-color: #fff;
  }
}

/* Main Table Styling */
.kcst-table {
  border-collapse: collapse;
  width: 100%;

  th,
  td {
    border: 1px solid #000;
    padding: 6px 8px;
    font-size: 15px;
    vertical-align: middle;
  }

  th {
    background-color: #eaeaea;
    font-weight: bold;
    text-align: center;
    font-size: 15px;
    padding: 8px 4px;

    .en-sub {
      font-size: 12px;
      font-weight: normal;
      display: block;
      color: #333;
    }
  }

  tbody tr {
    height: 36px;
  }
}

.doc-desc {
  word-break: break-word;
}

/* Signature Section Styling */
.signature-section {
  padding-top: 16px;
}

.signature-block {
  width: 280px;
  text-align: center;
}

.signature-space {
  height: 60px;
  width: 100%;
  position: relative;
}

.digital-sig-img {
  max-height: 55px;
  max-width: 220px;
  object-fit: contain;
}

.dots-line {
  width: 220px;
  border-bottom: 1px dashed #000;
  display: inline-block;
}

.signer-name {
  font-size: 16px;
}

.signer-role {
  font-size: 14px;
  color: #333;
}

.date-line {
  font-size: 14px;
  color: #444;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 15mm 12mm 15mm;
  }

  .printable-slip-wrapper {
    max-width: 100%;
    padding: 0;
    font-family: "TH Sarabun New", "TH Sarabun PSK", "Sarabun", sans-serif;
  }

  .info-grid-table .info-label,
  .kcst-table th {
    background-color: #eaeaea !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
