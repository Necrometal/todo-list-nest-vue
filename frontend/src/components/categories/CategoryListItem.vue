<script setup lang="ts">
import Button from 'primevue/button'
import type { Category } from '@/stores/categories'

defineProps<{ category: Category }>()
const emit = defineEmits<{ edit: [category: Category]; delete: [category: Category] }>()
</script>

<template>
  <li
    class="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
    data-testid="category-item"
  >
    <span
      class="h-3 w-3 shrink-0 rounded-full"
      :style="{ backgroundColor: category.color }"
      aria-hidden="true"
    />
    <button type="button" class="min-w-0 flex-1 text-left" @click="emit('edit', category)">
      <span class="block truncate text-sm text-foreground">{{ category.name }}</span>
    </button>
    <Button
      text
      size="small"
      icon="pi pi-trash"
      severity="danger"
      aria-label="Delete category"
      data-testid="category-delete-button"
      @click="emit('delete', category)"
    />
  </li>
</template>
