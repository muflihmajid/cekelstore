<template>
  <button class="app-button" :class="[`app-button--${variant}`, { 'is-block': block }]" :disabled="disabled || loading">
    <span v-if="loading" class="mini-loader" />
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
}>(), {
  variant: 'primary',
  block: false,
  loading: false,
  disabled: false,
});
</script>
