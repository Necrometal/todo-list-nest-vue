import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
}

export type TodoAction = 'created' | 'updated' | 'deleted'

export interface TodoHistoryEntry {
  id: string
  todoId: string
  todoTitle: string
  userId: string
  action: TodoAction
  changes: Record<string, { from: unknown; to: unknown }> | null
  createdAt: string
}

export type TodoFilter = 'all' | 'active' | 'completed'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const filter = ref<TodoFilter>('all')
  const search = ref('')
  const loading = ref(false)
  const error = ref('')

  const activeCount = computed(() => todos.value.filter((t) => !t.completed).length)

  const filteredTodos = computed(() => {
    const query = search.value.trim().toLowerCase()
    return todos.value
      .filter((t) => {
        if (filter.value === 'active') return !t.completed
        if (filter.value === 'completed') return t.completed
        return true
      })
      .filter((t) => (query ? t.title.toLowerCase().includes(query) : true))
  })

  function authToken() {
    return useAuthStore().token
  }

  async function fetchTodos() {
    loading.value = true
    error.value = ''
    try {
      todos.value = await apiFetch<Todo[]>('/todos', { token: authToken() })
    } catch {
      error.value = 'Could not load todos'
    } finally {
      loading.value = false
    }
  }

  async function createTodo(payload: { title: string; description?: string }) {
    const todo = await apiFetch<Todo>('/todos', {
      method: 'POST',
      body: payload,
      token: authToken(),
    })
    todos.value.unshift(todo)
  }

  async function toggleCompleted(todo: Todo) {
    const updated = await apiFetch<Todo>(`/todos/${todo.id}`, {
      method: 'PATCH',
      body: { completed: !todo.completed },
      token: authToken(),
    })
    const index = todos.value.findIndex((t) => t.id === todo.id)
    if (index !== -1) todos.value[index] = updated
  }

  async function updateTodo(id: string, patch: { title?: string; description?: string }) {
    const updated = await apiFetch<Todo>(`/todos/${id}`, {
      method: 'PATCH',
      body: patch,
      token: authToken(),
    })
    const index = todos.value.findIndex((t) => t.id === id)
    if (index !== -1) todos.value[index] = updated
  }

  async function deleteTodo(id: string) {
    await apiFetch<void>(`/todos/${id}`, { method: 'DELETE', token: authToken() })
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  return {
    todos,
    filter,
    search,
    loading,
    error,
    activeCount,
    filteredTodos,
    fetchTodos,
    createTodo,
    toggleCompleted,
    updateTodo,
    deleteTodo,
  }
})
