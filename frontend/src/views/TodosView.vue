<!--
THESIS: the list is the workspace; capture and edit happen in a focused modal
so the flat body stays purely about scanning and acting on todos.
OWN-WORLD: Instrument Panel — flat hairline-divided list, signal-blue reserved
for the one primary action (New Todo), modal dialog for the form.
FIRST VIEWPORT: page title + New Todo button, filter/search row, flat list.
FORM: precise user directive (dashboard/todos/history/modal/breadcrumb) —
shaped directly, no structure roll per new-work.md's precise-request rule.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
-->
<script setup lang="ts">
import TestView from '@/components/TestView.vue'
import TodoFilterBar from '@/components/todos/TodoFilterBar.vue'
import TodoFormModal from '@/components/todos/TodoFormModal.vue'
import TodoList from '@/components/todos/TodoList.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import type { Todo } from '@/stores/todos'
import { useTodosStore } from '@/stores/todos'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { onMounted, ref } from 'vue'

const todosStore = useTodosStore()

const modalVisible = ref(false)
const editingTodo = ref<Todo | null>(null)
const saving = ref(false)
const formError = ref('')

onMounted(() => {
  void todosStore.fetchTodos()
})

function openCreate() {
  editingTodo.value = null
  formError.value = ''
  modalVisible.value = true
}

function openEdit(todo: Todo) {
  editingTodo.value = todo
  formError.value = ''
  modalVisible.value = true
}

async function onSubmit(payload: { title: string; description: string }) {
  saving.value = true
  formError.value = ''
  try {
    if (editingTodo.value) {
      await todosStore.updateTodo(editingTodo.value.id, payload)
    } else {
      await todosStore.createTodo(payload)
    }
    modalVisible.value = false
  } catch {
    formError.value = editingTodo.value ? 'Could not save changes' : 'Could not add that todo'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <TestView />
        <h1 class="text-2xl font-semibold text-foreground">Todos, see what you need to do</h1>
        <Button icon="pi pi-plus" label="New Todo" @click="openCreate" />
      </div>

      <Message v-if="todosStore.error" severity="error" :closable="false">{{
        todosStore.error
      }}</Message>

      <TodoFilterBar
        v-model:search="todosStore.search"
        v-model:filter="todosStore.filter"
        :active-count="todosStore.activeCount"
      />

      <TodoList
        :todos="todosStore.filteredTodos"
        :loading="todosStore.loading"
        :has-any="todosStore.todos.length > 0"
        @edit="openEdit"
      />
    </div>

    <TodoFormModal
      v-model:visible="modalVisible"
      :todo="editingTodo"
      :saving="saving"
      :error="formError"
      @submit="onSubmit"
    />
  </AppLayout>
</template>
