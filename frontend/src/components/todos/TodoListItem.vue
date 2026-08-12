<script setup lang="ts">
import { useRouter } from 'vue-router'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import type { Todo } from '@/stores/todos'
import { useTodosStore } from '@/stores/todos'

const props = defineProps<{ todo: Todo }>()
const emit = defineEmits<{ edit: [todo: Todo] }>()

const todosStore = useTodosStore()
const router = useRouter()

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
