<script setup lang="ts">
import type { Todo } from '@/stores/todos'
import TodoListItem from './TodoListItem.vue'

defineProps<{ todos: Todo[]; loading: boolean; hasAny: boolean }>()
const emit = defineEmits<{ edit: [todo: Todo] }>()
</script>

<template>
  <ul v-if="loading" class="flex flex-col gap-3 pt-1" aria-busy="true">
    <li v-for="n in 3" :key="n" class="h-5 animate-pulse rounded-md bg-muted" />
  </ul>

  <div v-else-if="todos.length === 0" class="py-10 text-center">
    <p class="text-sm text-muted-foreground">
      {{ hasAny ? 'Nothing matches this filter.' : 'No todos yet — add your first one above.' }}
    </p>
  </div>

  <ul v-else class="flex flex-col">
    <TodoListItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @edit="emit('edit', $event)"
    />
  </ul>
</template>
