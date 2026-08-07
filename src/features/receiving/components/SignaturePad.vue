<template>
  <div class="signature-pad-container column items-center full-width">
    <div
      ref="canvasContainerRef"
      class="canvas-wrapper relative-position bg-white rounded-borders border-grey full-width overflow-hidden"
    >
      <canvas
        ref="canvasRef"
        class="signature-canvas touch-none cursor-pointer"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="stopDrawing"
      />

      <div
        v-if="isEmpty"
        class="placeholder-text absolute-center text-grey-5 pointer-events-none text-subtitle1"
      >
        ✍️ วาดลายเซ็นที่นี่ (Touch / Mouse)
      </div>
    </div>

    <!-- Action Toolbar -->
    <div class="row justify-between items-center full-width q-mt-sm">
      <q-btn
        flat
        color="grey-7"
        icon="refresh"
        label="ล้างลายเซ็น"
        :disabled="isEmpty"
        @click="clear"
      />
      <div class="text-caption text-grey-6">
        ผู้เซ็น: <span class="text-weight-bold text-dark">{{ signerName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = withDefaults(
  defineProps<{
    signerName: string;
    penColor?: string;
    lineWidth?: number;
  }>(),
  {
    penColor: "#000000",
    lineWidth: 3,
  },
);

const emit = defineEmits<{
  (e: "change", isEmpty: boolean): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainerRef = ref<HTMLDivElement | null>(null);

const isDrawing = ref(false);
const isEmpty = ref(true);

let ctx: CanvasRenderingContext2D | null = null;
let resizeObserver: ResizeObserver | null = null;

function initCanvas() {
  if (!canvasRef.value || !canvasContainerRef.value) return;
  const canvas = canvasRef.value;
  const container = canvasContainerRef.value;

  // Handle high DPR for crisp signature lines
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = Math.max(rect.height, 220) * dpr;

  ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = props.penColor;
    ctx.lineWidth = props.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }
}

function getPos(evt: MouseEvent): { x: number; y: number } {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function getTouchPos(evt: TouchEvent): { x: number; y: number } {
  if (!canvasRef.value || !evt.touches[0]) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  const touch = evt.touches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

function startDrawing(evt: MouseEvent) {
  isDrawing.value = true;
  const pos = getPos(evt);
  ctx?.beginPath();
  ctx?.moveTo(pos.x, pos.y);
}

function draw(evt: MouseEvent) {
  if (!isDrawing.value || !ctx) return;
  const pos = getPos(evt);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  if (isEmpty.value) {
    isEmpty.value = false;
    emit("change", false);
  }
}

function handleTouchStart(evt: TouchEvent) {
  isDrawing.value = true;
  const pos = getTouchPos(evt);
  ctx?.beginPath();
  ctx?.moveTo(pos.x, pos.y);
}

function handleTouchMove(evt: TouchEvent) {
  if (!isDrawing.value || !ctx) return;
  const pos = getTouchPos(evt);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  if (isEmpty.value) {
    isEmpty.value = false;
    emit("change", false);
  }
}

function stopDrawing() {
  if (isDrawing.value) {
    isDrawing.value = false;
    ctx?.closePath();
  }
}

function clear() {
  if (!canvasRef.value || !ctx) return;
  const canvas = canvasRef.value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  isEmpty.value = true;
  emit("change", true);
}

/** Export canvas signature as PNG Blob */
function toBlob(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!canvasRef.value || isEmpty.value) {
      resolve(null);
      return;
    }
    canvasRef.value.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
}

onMounted(() => {
  initCanvas();
  if (canvasContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // Re-init canvas on window resize if empty
      if (isEmpty.value) {
        initCanvas();
      }
    });
    resizeObserver.observe(canvasContainerRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

defineExpose({
  clear,
  toBlob,
  isEmpty,
});
</script>

<style scoped>
.canvas-wrapper {
  height: 240px;
  border: 2px dashed #1976d2;
}

.signature-canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
}

.pointer-events-none {
  pointer-events: none;
}
</style>
