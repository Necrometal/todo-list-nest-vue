import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

export interface Category {
  id: string
  name: string
  color: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref('')

  function authToken() {
    return useAuthStore().token
  }

  function nameById(id: string | null): string | null {
    if (!id) return null
    return categories.value.find((c) => c.id === id)?.name ?? null
  }

  async function fetchCategories() {
    loading.value = true
    error.value = ''
    try {
      categories.value = await apiFetch<Category[]>('/categories', { token: authToken() })
    } catch {
      error.value = 'Could not load categories'
    } finally {
      loading.value = false
    }
  }

  async function createCategory(payload: { name: string; color?: string }) {
    const category = await apiFetch<Category>('/categories', {
      method: 'POST',
      body: payload,
      token: authToken(),
    })
    categories.value.push(category)
    return category
  }

  async function updateCategory(id: string, patch: { name?: string; color?: string }) {
    const updated = await apiFetch<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: patch,
      token: authToken(),
    })
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value[index] = updated
    return updated
  }

  async function deleteCategory(id: string) {
    await apiFetch<void>(`/categories/${id}`, { method: 'DELETE', token: authToken() })
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  return {
    categories,
    loading,
    error,
    nameById,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
