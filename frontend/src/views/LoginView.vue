<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/api'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.push(redirect)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto mt-24 max-w-sm">
    <h1 class="mb-6 text-2xl font-semibold text-foreground">Login</h1>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-muted-foreground">Email</span>
        <InputText v-model="email" type="email" autocomplete="email" required fluid />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-muted-foreground">Password</span>
        <Password
          v-model="password"
          autocomplete="current-password"
          required
          :feedback="false"
          toggle-mask
          fluid
        />
      </label>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Button type="submit" :loading="loading" label="Login" />
    </form>
    <p class="mt-4 text-sm text-muted-foreground">
      No account? <RouterLink class="text-primary underline" to="/register">Register</RouterLink>
    </p>
  </div>
</template>
