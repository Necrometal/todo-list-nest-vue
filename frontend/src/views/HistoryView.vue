<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useHistoryStore } from '@/stores/history'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import type { TodoHistoryEntry } from '@/stores/todos'

const historyStore = useHistoryStore()
const route = useRoute()
const search = ref(typeof route.query.q === 'string' ? route.query.q : '')

onMounted(() => {
  void historyStore.fetchAll()
})

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return historyStore.entries
  return historyStore.entries.filter((entry) =>
    entry.todoTitle.toLowerCase().includes(query),
  )
})

const ACTION_ICON: Record<TodoHistoryEntry['action'], string> = {
  created: 'pi-plus',
  updated: 'pi-pencil',
  deleted: 'pi-trash',
}

const ACTION_LABEL: Record<TodoHistoryEntry['action'], string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function summarize(entry: TodoHistoryEntry): string | null {
  // Only "updated" entries carry a {field: {from, to}} diff; "created" and
  // "deleted" changes (when present) are a flat snapshot, not a diff, and
  // the action label + todo title already say everything worth showing.
  if (entry.action !== 'updated' || !entry.changes) return null
  return Object.entries(entry.changes)
    .map(([field, diff]) => `${field}: ${String(diff.from)} → ${String(diff.to)}`)
    .join(', ')
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-semibold text-foreground">History</h1>

      <Message v-if="historyStore.error" severity="error" :closable="false">{{
        historyStore.error
      }}</Message>

      <IconField class="max-w-sm">
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Filter by todo title" fluid />
      </IconField>

      <ul v-if="historyStore.loading" class="flex flex-col gap-3 pt-1" aria-busy="true">
        <li v-for="n in 4" :key="n" class="h-5 animate-pulse rounded-md bg-muted" />
      </ul>

      <div v-else-if="filtered.length === 0" class="py-10 text-center">
        <p class="text-sm text-muted-foreground">
          {{ search ? 'No history matches that filter.' : 'No activity yet.' }}
        </p>
      </div>

      <ul v-else class="flex flex-col">
        <li
          v-for="entry in filtered"
          :key="entry.id"
          class="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
        >
          <i :class="['pi', ACTION_ICON[entry.action], 'mt-0.5 text-sm text-muted-foreground']" />
          <div class="min-w-0 flex-1">
            <p class="text-sm text-foreground">
              <span class="font-medium">{{ ACTION_LABEL[entry.action] }}</span>
              · {{ entry.todoTitle }}
            </p>
            <p v-if="summarize(entry)" class="text-xs text-muted-foreground">
              {{ summarize(entry) }}
            </p>
            <p class="text-xs text-muted-foreground">{{ formatDate(entry.createdAt) }}</p>
          </div>
        </li>
      </ul>
    </div>
  </AppLayout>
</template>
