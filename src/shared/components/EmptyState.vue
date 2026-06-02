<template>
  <div class="empty-state">
    <div class="empty-state__icon">{{ icon || '🛍️' }}</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; description: string; icon?: string }>();
</script>
