<script setup lang="ts">
import { ref } from 'vue'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import type { Todo, TodoHistoryEntry } from '@/stores/todos'
import { useTodosStore } from '@/stores/todos'

const props = defineProps<{ todo: Todo }>()
const todosStore = useTodosStore()

const expanded = ref(false)
const history = ref<TodoHistoryEntry[] | null>(null)
const historyLoading = ref(false)

const editingTitle = ref(false)
const titleDraft = ref(props.todo.title)
const descriptionDraft = ref(props.todo.description ?? '')

async function onToggle() {
  await todosStore.toggleCompleted(props.todo)
}

async function onToggleExpand() {
  expanded.value = !expanded.value
  if (expanded.value && history.value === null) {
    historyLoading.value = true
    try {
      history.value = await todosStore.fetchHistory(props.todo.id)
    } finally {
      historyLoading.value = false
    }
  }
}

async function saveTitle() {
  editingTitle.value = false
  const value = titleDraft.value.trim()
  if (!value || value === props.todo.title) {
    titleDraft.value = props.todo.title
    return
  }
  await todosStore.updateTodo(props.todo.id, { title: value })
  history.value = null
}

async function saveDescription() {
  const value = descriptionDraft.value.trim()
  if (value === (props.todo.description ?? '')) return
  await todosStore.updateTodo(props.todo.id, { description: value })
  history.value = null
}

async function onDelete() {
  await todosStore.deleteTodo(props.todo.id)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const actionLabel: Record<TodoHistoryEntry['action'], string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
}
</script>

<template>
  <li class="border-b border-border py-3 last:border-b-0">
    <div class="flex items-start gap-3">
      <Checkbox :model-value="todo.completed" binary class="mt-0.5" @update:model-value="onToggle" />

      <div class="min-w-0 flex-1">
        <InputText
          v-if="editingTitle"
          v-model="titleDraft"
          class="w-full"
          size="small"
          autofocus
          @keyup.enter="saveTitle"
          @blur="saveTitle"
        />
        <button
          v-else
          type="button"
          class="block w-full truncate text-left text-sm text-foreground"
          :class="{ 'text-muted-foreground line-through': todo.completed }"
          @click="editingTitle = true"
        >
          {{ todo.title }}
        </button>
        <span class="text-xs text-muted-foreground">{{ formatDate(todo.updatedAt) }}</span>
      </div>

      <Button
        text
        size="small"
        :icon="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
        severity="secondary"
        aria-label="Toggle details"
        @click="onToggleExpand"
      />
      <Button
        text
        size="small"
        icon="pi pi-trash"
        severity="danger"
        aria-label="Delete todo"
        @click="onDelete"
      />
    </div>

    <div v-if="expanded" class="mt-3 flex flex-col gap-4 pl-8">
      <Textarea
        v-model="descriptionDraft"
        placeholder="Add a description"
        rows="2"
        class="text-sm"
        fluid
        @blur="saveDescription"
      />

      <div>
        <div class="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <i class="pi pi-clock text-[11px]" />
          <span>History</span>
        </div>
        <p v-if="historyLoading" class="text-xs text-muted-foreground">Loading history…</p>
        <ul v-else-if="history && history.length" class="flex flex-col gap-1.5">
          <li v-for="entry in history" :key="entry.id" class="text-xs text-muted-foreground">
            <span class="font-medium text-foreground">{{ actionLabel[entry.action] }}</span>
            · {{ formatDate(entry.createdAt) }}
          </li>
        </ul>
        <p v-else class="text-xs text-muted-foreground">No history yet.</p>
      </div>
    </div>
  </li>
</template>
