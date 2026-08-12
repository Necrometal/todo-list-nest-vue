<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Todo } from '@/stores/todos'
import { useTodosStore } from '@/stores/todos'
import { useCategoriesStore } from '@/stores/categories'

const props = defineProps<{ todo: Todo }>()
const emit = defineEmits<{ edit: [todo: Todo] }>()

const todosStore = useTodosStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()

const category = computed(() =>
  categoriesStore.categories.find((c) => c.id === props.todo.categoryId),
)

async function onToggle() {
  await todosStore.toggleCompleted(props.todo)
}

async function onDelete() {
  await todosStore.deleteTodo(props.todo.id)
}

function onViewHistory() {
  void router.push({ path: '/history', query: { q: props.todo.title } })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<template>
  <li class="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
    <Checkbox :model-value="todo.completed" binary class="mt-0.5" @update:model-value="onToggle" />

    <button
      type="button"
      class="min-w-0 flex-1 text-left"
      @click="emit('edit', todo)"
    >
      <span
        class="block truncate text-sm text-foreground"
        :class="{ 'text-muted-foreground line-through': todo.completed }"
      >
        {{ todo.title }}
      </span>
      <span class="text-xs text-muted-foreground">{{ formatDate(todo.updatedAt) }}</span>
    </button>

    <Tag
      v-if="category"
      :value="category.name"
      :style="{ backgroundColor: category.color }"
      class="shrink-0"
      data-testid="todo-category-tag"
    />

    <Button
      text
      size="small"
      icon="pi pi-clock"
      severity="secondary"
      aria-label="View history"
      @click="onViewHistory"
    />
    <Button
      text
      size="small"
      icon="pi pi-trash"
      severity="danger"
      aria-label="Delete todo"
      @click="onDelete"
    />
  </li>
</template>
