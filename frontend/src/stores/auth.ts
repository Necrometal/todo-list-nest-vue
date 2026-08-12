import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/lib/api'

export interface AuthUser {
  id: string
  email: string
  name: string
}

interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('accessToken'))
  const user = ref<AuthUser | null>(
    JSON.parse(localStorage.getItem('authUser') ?? 'null') as AuthUser | null,
  )

  const isAuthenticated = computed(() => !!token.value)

  function setSession(session: AuthResponse) {
    token.value = session.accessToken
    user.value = session.user
    localStorage.setItem('accessToken', session.accessToken)
    localStorage.setItem('authUser', JSON.stringify(session.user))
  }

  async function login(email: string, password: string) {
    const session = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setSession(session)
  }

  async function register(email: string, password: string, name: string) {
    const session = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    })
    setSession(session)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('authUser')
  }

  return { token, user, isAuthenticated, login, register, logout }
})
