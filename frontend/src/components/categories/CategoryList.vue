<script setup lang="ts">
import type { Category } from '@/stores/categories'
import CategoryListItem from './CategoryListItem.vue'

defineProps<{ categories: Category[]; loading: boolean }>()
const emit = defineEmits<{ edit: [category: Category]; delete: [category: Category] }>()
</script>

<template>
  <ul v-if="loading" class="flex flex-col gap-3 pt-1" aria-busy="true">
    <li v-for="n in 3" :key="n" class="h-5 animate-pulse rounded-md bg-muted" />
  </ul>

  <div v-else-if="categories.length === 0" class="py-10 text-center">
    <p class="text-sm text-muted-foreground">No categories yet — add your first one above.</p>
  </div>

  <ul v-else class="flex flex-col">
    <CategoryListItem
      v-for="category in categories"
      :key="category.id"
      :category="category"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </ul>
</template>
