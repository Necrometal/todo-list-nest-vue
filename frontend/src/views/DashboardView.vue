<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function onLogout() {
  auth.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="dashboard">
    <header>
      <h1>Todo Dashboard</h1>
      <div>
        <span>Welcome, {{ auth.user?.name }}</span>
        <button @click="onLogout">Logout</button>
      </div>
    </header>
    <p>Todo list coming next.</p>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 640px;
  margin: 2rem auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
