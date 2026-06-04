<template>
  <div class="sparkline" aria-hidden="true">
    <svg viewBox="0 0 140 52" preserveAspectRatio="none">
      <path :d="areaPath" class="sparkline-area" />
      <path :d="path" class="sparkline-line" />
      <circle v-if="showDots" cx="108" cy="13" r="3.5" class="sparkline-dot" />
      <circle v-if="showDots" cx="134" cy="19" r="3.5" class="sparkline-dot" />
    </svg>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  path?: string;
  areaPath?: string;
  showDots?: boolean;
}>(), {
  path: 'M4 42 C18 40 24 22 40 24 C54 26 60 35 74 32 C88 29 95 15 110 12 C122 9 130 18 136 16',
  areaPath: 'M4 42 C18 40 24 22 40 24 C54 26 60 35 74 32 C88 29 95 15 110 12 C122 9 130 18 136 16 L136 52 L4 52 Z',
  showDots: true,
});
</script>

<style scoped>
.sparkline {
  width: 118px;
  height: 44px;
  opacity: .9;
  pointer-events: none;
}

.sparkline svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.sparkline-line {
  fill: none;
  stroke: var(--sparkline-color, #8edfd8);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 5px 10px rgba(22, 170, 165, .16));
}

.sparkline-area {
  fill: var(--sparkline-color, #8edfd8);
  fill-opacity: .12;
}

.sparkline-dot {
  fill: #fffdf8;
  stroke: var(--sparkline-color, #8edfd8);
  stroke-width: 3;
}
</style>
