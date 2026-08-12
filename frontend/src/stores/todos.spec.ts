import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTodosStore, type Todo } from './todos'
import { useAuthStore } from './auth'
import { apiFetch } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

function makeTodo(overrides: Partial<Todo>): Todo {
  return {
    id: 'id',
    title: 'title',
    description: null,
    completed: false,
    ownerId: 'owner',
    categoryId: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('todos store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedApiFetch.mockReset()
    useAuthStore().token = 'test-token'
  })

  it('filters todos by categoryFilter', () => {
    const store = useTodosStore()
    store.todos = [
      makeTodo({ id: '1', categoryId: 'cat-a' }),
      makeTodo({ id: '2', categoryId: 'cat-b' }),
      makeTodo({ id: '3', categoryId: null }),
    ]

    store.categoryFilter = 'cat-a'

    expect(store.filteredTodos.map((t) => t.id)).toEqual(['1'])
  })

  it('shows every todo when categoryFilter is cleared', () => {
    const store = useTodosStore()
    store.todos = [makeTodo({ id: '1', categoryId: 'cat-a' }), makeTodo({ id: '2', categoryId: null })]

    store.categoryFilter = null

    expect(store.filteredTodos.map((t) => t.id)).toEqual(['1', '2'])
  })

  it('combines the status filter and the category filter', () => {
    const store = useTodosStore()
    store.todos = [
      makeTodo({ id: '1', categoryId: 'cat-a', completed: true }),
      makeTodo({ id: '2', categoryId: 'cat-a', completed: false }),
    ]
    store.filter = 'active'
    store.categoryFilter = 'cat-a'

    expect(store.filteredTodos.map((t) => t.id)).toEqual(['2'])
  })

  it('sends categoryId when creating a todo', async () => {
    const created = makeTodo({ id: 'new', categoryId: 'cat-a' })
    mockedApiFetch.mockResolvedValueOnce(created)

    const store = useTodosStore()
    await store.createTodo({ title: 'Buy milk', categoryId: 'cat-a' })

    expect(mockedApiFetch).toHaveBeenCalledWith('/todos', {
      method: 'POST',
      body: { title: 'Buy milk', categoryId: 'cat-a' },
      token: 'test-token',
    })
    expect(store.todos[0]).toEqual(created)
  })
})
