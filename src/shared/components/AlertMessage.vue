<template>
  <div v-if="message" class="alert" :class="`alert--${type || 'info'}`">{{ message }}</div>
</template>

<script setup lang="ts">
defineProps<{ message?: string | null; type?: 'info' | 'success' | 'error' }>();
</script>
