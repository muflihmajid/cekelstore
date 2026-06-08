<script setup lang="ts">
defineProps<{
  categories: string[];
  modelValue?: string;
  allLabel?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();
</script>

<template>
  <div class="cekel-categories" role="group" aria-label="Product categories">
    <button
      class="cekel-category"
      type="button"
      :aria-pressed="!modelValue"
      @click="emit('update:modelValue', undefined)"
    >
      {{ allLabel ?? 'All' }}
    </button>
    <button
      v-for="category in categories"
      :key="category"
      class="cekel-category"
      type="button"
      :aria-pressed="modelValue === category"
      @click="emit('update:modelValue', category)"
    >
      {{ category }}
    </button>
  </div>
</template>
