<script setup lang="ts">
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import type { TodoFilter } from '@/stores/todos'

const search = defineModel<string>('search', { required: true })
const filter = defineModel<TodoFilter>('filter', { required: true })

defineProps<{ activeCount: number }>()

const filterOptions: { label: string; value: TodoFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <IconField class="min-w-40 flex-1">
      <InputIcon class="pi pi-search" />
      <InputText v-model="search" placeholder="Search" size="small" fluid />
    </IconField>
    <div class="flex items-center gap-3">
      <span class="whitespace-nowrap text-sm text-muted-foreground">{{ activeCount }} active</span>
      <SelectButton
        v-model="filter"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
      />
    </div>
  </div>
</template>
