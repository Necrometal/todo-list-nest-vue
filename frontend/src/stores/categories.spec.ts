import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCategoriesStore } from './categories'
import { useAuthStore } from './auth'
import { apiFetch } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

describe('categories store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedApiFetch.mockReset()
    useAuthStore().token = 'test-token'
  })

  it('fetches categories and stores them', async () => {
    const categories = [{ id: '1', name: 'Work', color: '#000000', ownerId: 'u1', createdAt: '', updatedAt: '' }]
    mockedApiFetch.mockResolvedValueOnce(categories)

    const store = useCategoriesStore()
    await store.fetchCategories()

    expect(mockedApiFetch).toHaveBeenCalledWith('/categories', { token: 'test-token' })
    expect(store.categories).toEqual(categories)
    expect(store.error).toBe('')
  })

  it('sets an error when the fetch fails', async () => {
    mockedApiFetch.mockRejectedValueOnce(new Error('boom'))

    const store = useCategoriesStore()
    await store.fetchCategories()

    expect(store.error).toBe('Could not load categories')
  })

  it('appends a created category', async () => {
    const created = { id: '2', name: 'Home', color: '#123456', ownerId: 'u1', createdAt: '', updatedAt: '' }
    mockedApiFetch.mockResolvedValueOnce(created)

    const store = useCategoriesStore()
    await store.createCategory({ name: 'Home', color: '#123456' })

    expect(store.categories).toContainEqual(created)
  })

  it('removes a category by id', async () => {
    const store = useCategoriesStore()
    store.categories.push({ id: '3', name: 'Gone', color: '#fff', ownerId: 'u1', createdAt: '', updatedAt: '' })
    mockedApiFetch.mockResolvedValueOnce(undefined)

    await store.deleteCategory('3')

    expect(store.categories.find((c) => c.id === '3')).toBeUndefined()
  })

  it('resolves category name by id', () => {
    const store = useCategoriesStore()
    store.categories.push({ id: '4', name: 'Errands', color: '#fff', ownerId: 'u1', createdAt: '', updatedAt: '' })

    expect(store.nameById('4')).toBe('Errands')
    expect(store.nameById(null)).toBeNull()
    expect(store.nameById('missing')).toBeNull()
  })
})
