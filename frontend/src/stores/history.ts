import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { TodoHistoryEntry } from '@/stores/todos'

export type StatsGroupBy = 'day' | 'month' | 'year'

export interface TodoStatsBucket {
  period: string
  created: number
  completed: number
}

export const useHistoryStore = defineStore('history', () => {
  const entries = ref<TodoHistoryEntry[]>([])
  const loading = ref(false)
  const error = ref('')

  const stats = ref<TodoStatsBucket[]>([])
  const statsLoading = ref(false)
  const groupBy = ref<StatsGroupBy>('day')

  function authToken() {
    return useAuthStore().token
  }

  async function fetchAll() {
    loading.value = true
    error.value = ''
    try {
      entries.value = await apiFetch<TodoHistoryEntry[]>('/history', {
        token: authToken(),
      })
    } catch {
      error.value = 'Could not load history'
    } finally {
      loading.value = false
    }
  }

  async function fetchStats(nextGroupBy: StatsGroupBy = groupBy.value) {
    groupBy.value = nextGroupBy
    statsLoading.value = true
    try {
      stats.value = await apiFetch<TodoStatsBucket[]>(
        `/todos/stats?groupBy=${nextGroupBy}`,
        { token: authToken() },
      )
    } finally {
      statsLoading.value = false
    }
  }

  return { entries, loading, error, stats, statsLoading, groupBy, fetchAll, fetchStats }
})
