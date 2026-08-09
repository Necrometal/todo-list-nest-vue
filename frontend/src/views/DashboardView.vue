<!--
THESIS: capture and recall beat organization theater; the bar you type into is
the whole nav, refusing the sidebar-and-cards SaaS-dashboard default.
OWN-WORLD: Instrument Panel — instrument-white flat body, hairline-gray
dividers, signal-blue as the only accent, one floating card-surface header.
STORY: visitor glances, adds or checks off a task in one motion, and can always
see what happened to any item via its inline history.
FIRST VIEWPORT: floating header, quick-add bar, compact filter row (search +
All/Active/Completed + count), flat hairline-divided list below.
FORM: command-bar/search-first, structure 3 of 7, seed key ce1e7c01.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
-->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import TodoCaptureBar from '@/components/todos/TodoCaptureBar.vue'
import TodoFilterBar from '@/components/todos/TodoFilterBar.vue'
import TodoList from '@/components/todos/TodoList.vue'
import Message from 'primevue/message'
import { useTodosStore } from '@/stores/todos'

const todosStore = useTodosStore()
const addError = ref('')

onMounted(() => {
  void todosStore.fetchTodos()
})

async function onAdd(title: string) {
  addError.value = ''
  try {
    await todosStore.createTodo(title)
  } catch {
    addError.value = 'Could not add that todo'
  }
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <TodoCaptureBar @add="onAdd" />
      <Message v-if="addError" severity="error" :closable="false">{{ addError }}</Message>
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
      />
    </div>
  </AppLayout>
</template>
