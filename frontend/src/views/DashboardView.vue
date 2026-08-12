<!--
THESIS: the dashboard is a readout, not a report — one glance shows the shape
of your activity, no decoration standing in for data.
OWN-WORLD: Instrument Panel — a flat hairline-divided stat strip, one signal-
blue series in the chart marking Completed, Created stays neutral gray.
FIRST VIEWPORT: title, period toggle, stat strip, created/completed bar chart.
FORM: precise user directive (dashboard/todos/history/modal/breadcrumb) —
shaped directly, no structure roll per new-work.md's precise-request rule.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
-->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import Chart from 'primevue/chart'
import SelectButton from 'primevue/selectbutton'
import { useTodosStore } from '@/stores/todos'
import { useHistoryStore } from '@/stores/history'
import type { StatsGroupBy } from '@/stores/history'

const todosStore = useTodosStore()
const historyStore = useHistoryStore()

const groupByOptions: { label: string; value: StatsGroupBy }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
]
const groupBy = ref<StatsGroupBy>('day')

onMounted(() => {
  void todosStore.fetchTodos()
  void historyStore.fetchStats(groupBy.value)
})

watch(groupBy, (value) => {
  void historyStore.fetchStats(value)
})

const total = computed(() => todosStore.todos.length)
const completed = computed(() => todosStore.todos.filter((t) => t.completed).length)
const active = computed(() => total.value - completed.value)
const completionRate = computed(() =>
  total.value === 0 ? 0 : Math.round((completed.value / total.value) * 100),
)

function cssVar(name: string) {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const chartData = computed(() => ({
  labels: historyStore.stats.map((bucket) => bucket.period),
  datasets: [
    {
      label: 'Created',
      backgroundColor: cssVar('--muted-foreground'),
      data: historyStore.stats.map((bucket) => bucket.created),
      borderRadius: 3,
      maxBarThickness: 28,
    },
    {
      label: 'Completed',
      backgroundColor: cssVar('--primary'),
      data: historyStore.stats.map((bucket) => bucket.completed),
      borderRadius: 3,
      maxBarThickness: 28,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: cssVar('--muted-foreground') } },
  },
  scales: {
    x: {
      ticks: { color: cssVar('--muted-foreground') },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { color: cssVar('--muted-foreground'), precision: 0 },
      grid: { color: cssVar('--border') },
    },
  },
}))
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-foreground">Dashboard</h1>
        <SelectButton
          v-model="groupBy"
          :options="groupByOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
        />
      </div>

      <div class="flex divide-x divide-border rounded-lg border border-border">
        <div class="flex-1 px-4 py-3">
          <p class="text-xs text-muted-foreground">Total</p>
          <p class="text-xl font-semibold text-foreground">{{ total }}</p>
        </div>
        <div class="flex-1 px-4 py-3">
          <p class="text-xs text-muted-foreground">Active</p>
          <p class="text-xl font-semibold text-foreground">{{ active }}</p>
        </div>
        <div class="flex-1 px-4 py-3">
          <p class="text-xs text-muted-foreground">Completed</p>
          <p class="text-xl font-semibold text-foreground">{{ completed }}</p>
        </div>
        <div class="flex-1 px-4 py-3">
          <p class="text-xs text-muted-foreground">Completion rate</p>
          <p class="text-xl font-semibold text-primary">{{ completionRate }}%</p>
        </div>
      </div>

      <div class="h-72 rounded-lg border border-border p-4">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-full" />
      </div>
    </div>
  </AppLayout>
</template>
