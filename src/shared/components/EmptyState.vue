<template>
  <div class="empty-state">
    <div class="empty-state__icon" aria-hidden="true">
      <SearchX v-if="icon === '?'" :size="34" stroke-width="2.2" />
      <Inbox v-else :size="34" stroke-width="2.2" />
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { Inbox, SearchX } from '@lucide/vue';

defineProps<{ title: string; description: string; icon?: string }>();
</script>
