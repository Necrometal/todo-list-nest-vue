<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'

const auth = useAuthStore()
const router = useRouter()

async function onLogout() {
  auth.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header
      class="sticky top-0 z-10 mx-auto flex max-w-2xl items-center justify-between rounded-b-lg border border-t-0 border-border bg-card px-5 py-3 shadow-sm"
    >
      <span class="text-sm font-semibold tracking-tight text-foreground">Todo List</span>
      <div class="flex items-center gap-3">
        <span class="text-sm text-muted-foreground">{{ auth.user?.name }}</span>
        <Button severity="secondary" size="small" label="Logout" @click="onLogout" />
      </div>
    </header>
    <main class="mx-auto max-w-2xl px-5 py-6">
      <slot />
    </main>
  </div>
</template>
