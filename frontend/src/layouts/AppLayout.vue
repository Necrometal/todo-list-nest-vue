<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'
import Breadcrumb from 'primevue/breadcrumb'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'pi-gauge' },
  { to: '/todos', label: 'Todos', icon: 'pi-list-check' },
  { to: '/history', label: 'History', icon: 'pi-clock' },
]

const breadcrumbModel = computed(() =>
  route.meta.breadcrumb ? [{ label: route.meta.breadcrumb }] : [],
)
const breadcrumbHome = { icon: 'pi pi-home', route: '/dashboard' }

async function onLogout() {
  auth.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background md:flex">
    <aside
      class="sticky top-4 z-10 mx-4 mt-4 hidden h-fit w-52 shrink-0 flex-col gap-1 rounded-lg border border-border bg-muted p-3 shadow-sm md:flex"
    >
      <span class="mb-2 px-2 text-sm font-semibold tracking-tight text-foreground"
        >Todo List</span
      >
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
        active-class="bg-background text-foreground"
      >
        <i :class="['pi', item.icon, 'text-sm']" />
        {{ item.label }}
      </RouterLink>
    </aside>

    <div class="min-w-0 flex-1">
      <header
        class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-muted px-5 py-3 shadow-sm md:mx-4 md:mt-4 md:rounded-lg md:border"
      >
        <span class="text-sm font-semibold tracking-tight text-foreground md:hidden"
          >Todo List</span
        >
        <nav class="flex items-center gap-1 md:hidden">
          <RouterLink
            v-for="item in NAV_ITEMS"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            active-class="text-foreground font-medium"
          >
            <i :class="['pi', item.icon]" />
            {{ item.label }}
          </RouterLink>
        </nav>
        <div class="ml-auto flex items-center gap-3">
          <span class="hidden text-sm text-muted-foreground sm:inline">{{
            auth.user?.name
          }}</span>
          <Button severity="secondary" size="small" label="Logout" @click="onLogout" />
        </div>
      </header>

      <Breadcrumb :home="breadcrumbHome" :model="breadcrumbModel" class="mx-5 mt-3 md:mx-9" />

      <main class="px-5 py-4 md:px-9">
        <slot />
      </main>
    </div>
  </div>
</template>
