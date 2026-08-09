<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/api'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(email.value, password.value, name.value)
    await router.push('/dashboard')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto mt-24 max-w-sm">
    <h1 class="mb-6 text-2xl font-semibold text-foreground">Register</h1>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-muted-foreground">Name</span>
        <InputText v-model="name" type="text" autocomplete="name" required minlength="2" fluid />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-muted-foreground">Email</span>
        <InputText v-model="email" type="email" autocomplete="email" required fluid />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-muted-foreground">Password</span>
        <Password
          v-model="password"
          autocomplete="new-password"
          required
          :feedback="false"
          toggle-mask
          fluid
        />
      </label>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Button type="submit" :loading="loading" label="Register" />
    </form>
    <p class="mt-4 text-sm text-muted-foreground">
      Already have an account? <RouterLink class="text-primary underline" to="/login">Login</RouterLink>
    </p>
  </div>
</template>
