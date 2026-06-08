<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <input
    class="cekel-search"
    type="search"
    :value="modelValue"
    :placeholder="placeholder ?? 'Search products'"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
