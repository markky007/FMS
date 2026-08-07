<template>
  <q-card flat bordered class="bg-blue-1 border-primary">
    <q-card-section class="q-pa-md">
      <div
        class="text-subtitle2 text-weight-bold text-primary q-mb-sm row items-center"
      >
        <q-icon name="playlist_add" class="q-mr-xs" size="20px" />
        เพิ่มรายการเอกสาร (ลำดับที่ {{ nextItemNumber }})
      </div>

      <q-form @submit.prevent="handleSubmit" class="q-gutter-y-sm">
        <div class="row q-col-gutter-sm">
          <!-- Document Description (Auto focus) -->
          <div class="col-12 col-md-6">
            <q-input
              ref="docDescInputRef"
              v-model="form.document_description"
              label="เอกสารคืออะไร (พิมพ์รายละเอียดเอกสาร) *"
              outlined
              dense
              bg-color="white"
              placeholder="เช่น ใบแจ้งหนี้, ใบเสร็จ, Report Driver"
              :rules="[val => !!val || 'กรุณากรอกรายละเอียดเอกสาร']"
              @keydown.enter.prevent="focusNext('receiver')"
            />
          </div>

          <!-- Receiver Name -->
          <div class="col-12 col-sm-8 col-md-4">
            <q-select
              v-model="selectedReceiver"
              use-input
              input-debounce="0"
              label="ชื่อผู้รับ *"
              :options="receiverOptions"
              outlined
              dense
              bg-color="white"
              hint="พิมพ์หรือเลือกรายชื่อผู้รับ"
              @filter="filterReceivers"
              @new-value="createReceiverValue"
              @update:model-value="onReceiverSelected"
            />
          </div>

          <!-- Quantity -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-input
              v-model.number="form.quantity"
              type="number"
              label="จำนวน *"
              outlined
              dense
              bg-color="white"
              min="1"
              :rules="[val => val > 0 || 'จำนวน > 0']"
            />
          </div>
        </div>

        <!-- Sender Name (Default to current user) -->
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.sender_name"
              label="ชื่อผู้ส่ง *"
              outlined
              dense
              bg-color="white"
              :rules="[val => !!val || 'กรุณากรอกชื่อผู้ส่ง']"
            />
          </div>

          <div class="col-12 col-sm-6">
            <AttachmentUploader v-model:files="pendingFiles" />
          </div>
        </div>

        <div class="row justify-end q-mt-sm">
          <q-btn
            type="submit"
            color="primary"
            icon="add_circle"
            label="เพิ่มรายการ (Enter)"
            unelevated
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { QInput } from "quasar";
import { useAuthStore } from "@/stores/auth.store";
import { useUserDirectoryStore } from "@/stores/user-directory.store";
import AttachmentUploader from "./AttachmentUploader.vue";

const props = defineProps<{
  nextItemNumber: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (
    e: "add-item",
    item: {
      document_description: string;
      receiver_name: string;
      receiver_user_id?: string | undefined;
      sender_name: string;
      sender_user_id?: string | undefined;
      quantity: number;
      files: File[];
    }
  ): void;
}>();

const authStore = useAuthStore();
const userDirectoryStore = useUserDirectoryStore();

const docDescInputRef = ref<QInput | null>(null);
const pendingFiles = ref<File[]>([]);

const form = ref({
  document_description: "",
  receiver_name: "",
  receiver_user_id: undefined as string | undefined,
  sender_name: authStore.fullName || "",
  sender_user_id: authStore.userId || undefined,
  quantity: 1
});

const selectedReceiver = ref<string | { label: string; value: string }>("");
const filteredUsers = ref(userDirectoryStore.users);

const receiverOptions = computed(() =>
  filteredUsers.value.map(u => ({
    label: u.full_name,
    value: u.id
  }))
);

function filterReceivers(val: string, update: (fn: () => void) => void) {
  update(() => {
    if (!val) {
      filteredUsers.value = userDirectoryStore.users;
    } else {
      const needle = val.toLowerCase();
      filteredUsers.value = userDirectoryStore.users.filter(v =>
        v.full_name.toLowerCase().includes(needle)
      );
    }
  });
}

function createReceiverValue(val: string, done: (val: string) => void) {
  form.value.receiver_name = val;
  form.value.receiver_user_id = undefined;
  done(val);
}

function onReceiverSelected(
  val: string | { label: string; value: string } | null
) {
  if (typeof val === "object" && val !== null) {
    form.value.receiver_name = val.label;
    form.value.receiver_user_id = val.value;
  } else if (typeof val === "string") {
    form.value.receiver_name = val;
    form.value.receiver_user_id = undefined;
  }
}

function focusNext(target: string) {
  if (target === "receiver") {
    // Keep focus flow smooth
  }
}

function handleSubmit() {
  if (
    !form.value.document_description.trim() ||
    !form.value.receiver_name.trim()
  ) {
    return;
  }

  emit("add-item", {
    document_description: form.value.document_description,
    receiver_name: form.value.receiver_name,
    receiver_user_id: form.value.receiver_user_id,
    sender_name: form.value.sender_name || authStore.fullName || "",
    sender_user_id: authStore.userId || undefined,
    quantity: form.value.quantity,
    files: pendingFiles.value
  });

  // Reset form for next item entry
  form.value.document_description = "";
  form.value.quantity = 1;
  pendingFiles.value = [];

  // Refocus on document description for rapid entry
  setTimeout(() => {
    docDescInputRef.value?.focus();
  }, 100);
}

onMounted(() => {
  if (!form.value.sender_name && authStore.fullName) {
    form.value.sender_name = authStore.fullName;
  }
});
</script>

<style scoped>
.border-primary {
  border: 1px solid #1976d2;
}
</style>
