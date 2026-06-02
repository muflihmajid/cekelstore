<template>
  <label class="field">
    <span v-if="label" class="field__label">{{ label }}</span>
    <textarea v-if="textarea" class="input" :value="modelValue" :placeholder="placeholder" :rows="rows || 3" @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" />
    <input v-else class="input" :type="type || 'text'" :value="modelValue" :placeholder="placeholder" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number | null;
  label?: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  rows?: number;
}>();

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>
