<script setup lang="ts">
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import Select from 'primevue/select'
import type { TodoFilter } from '@/stores/todos'
import { useCategoriesStore } from '@/stores/categories'

const search = defineModel<string>('search', { required: true })
const filter = defineModel<TodoFilter>('filter', { required: true })
const categoryFilter = defineModel<string | null>('categoryFilter', { required: true })

defineProps<{ activeCount: number }>()

const categoriesStore = useCategoriesStore()

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
      <Select
        v-model="categoryFilter"
        :options="categoriesStore.categories"
        option-label="name"
        option-value="id"
        placeholder="All categories"
        show-clear
        size="small"
        class="min-w-40"
        data-testid="todo-category-filter"
      />
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
