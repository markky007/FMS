<template>
  <div class="signature-pad-container column items-center full-width">
    <div
      ref="canvasContainerRef"
      class="canvas-wrapper relative-position bg-white rounded-borders border-grey full-width overflow-hidden"
    >
      <canvas
        ref="canvasRef"
        class="signature-canvas touch-none cursor-pointer"
        @pointerdown="startDrawing"
        @pointermove="draw"
        @pointerup="stopDrawing"
        @pointercancel="stopDrawing"
        @pointerleave="stopDrawing"
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
        class="placeholder-text absolute-center text-grey-5 pointer-events-none text-subtitle1 unselectable"
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
import { ref, onMounted, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    signerName: string;
    penColor?: string;
    lineWidth?: number;
  }>(),
  {
    penColor: "#0f172a",
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

  const rect = container.getBoundingClientRect();
  const width = Math.floor(rect.width) || 400;
  const height = Math.floor(rect.height) || 220;

  // Retry if container width is not yet rendered in dialog animation
  if (width === 0 || height === 0) {
    requestAnimationFrame(initCanvas);
    return;
  }

  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = props.penColor;
    ctx.lineWidth = props.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }
}

function getPoint(evt: MouseEvent | PointerEvent): { x: number; y: number } {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function getTouchPoint(evt: TouchEvent): { x: number; y: number } {
  if (!canvasRef.value || !evt.touches[0]) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  const touch = evt.touches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

function startDrawing(evt: MouseEvent | PointerEvent) {
  evt.preventDefault();
  isDrawing.value = true;
  const pt = getPoint(evt);
  ctx?.beginPath();
  ctx?.moveTo(pt.x, pt.y);
}

function draw(evt: MouseEvent | PointerEvent) {
  if (!isDrawing.value || !ctx) return;
  evt.preventDefault();
  const pt = getPoint(evt);
  ctx.lineTo(pt.x, pt.y);
  ctx.stroke();

  if (isEmpty.value) {
    isEmpty.value = false;
    emit("change", false);
  }
}

function handleTouchStart(evt: TouchEvent) {
  isDrawing.value = true;
  const pt = getTouchPoint(evt);
  ctx?.beginPath();
  ctx?.moveTo(pt.x, pt.y);
}

function handleTouchMove(evt: TouchEvent) {
  if (!isDrawing.value || !ctx) return;
  const pt = getTouchPoint(evt);
  ctx.lineTo(pt.x, pt.y);
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
  setTimeout(() => {
    initCanvas();
  }, 100);

  if (canvasContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
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
  initCanvas,
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
  user-select: none;
  -webkit-user-select: none;
}

.pointer-events-none {
  pointer-events: none;
}

.unselectable {
  user-select: none;
  -webkit-user-select: none;
}
</style>
