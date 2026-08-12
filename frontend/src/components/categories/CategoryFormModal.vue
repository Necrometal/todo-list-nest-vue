<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import ColorPicker from 'primevue/colorpicker'
import Button from 'primevue/button'
import Message from 'primevue/message'
import type { Category } from '@/stores/categories'

const props = defineProps<{
  visible: boolean
  category?: Category | null
  saving?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [payload: { name: string; color: string }]
}>()

const DEFAULT_COLOR = '64748b'

const name = ref('')
const color = ref(DEFAULT_COLOR)

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      name.value = props.category?.name ?? ''
      color.value = props.category?.color.replace('#', '') ?? DEFAULT_COLOR
    }
  },
)

function close() {
  emit('update:visible', false)
}

function onSubmit() {
  const value = name.value.trim()
  if (!value) return
  emit('submit', { name: value, color: `#${color.value}` })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="category ? 'Edit category' : 'New category'"
    :style="{ width: '24rem' }"
    :draggable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-muted-foreground">Name</span>
        <InputText v-model="name" autofocus required fluid data-testid="category-name-input" />
      </label>
      <label class="flex items-center gap-3">
        <span class="text-sm text-muted-foreground">Color</span>
        <ColorPicker v-model="color" format="hex" />
      </label>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <div class="flex justify-end gap-2">
        <Button type="button" text severity="secondary" label="Cancel" @click="close" />
        <Button
          type="submit"
          :label="category ? 'Save' : 'Add'"
          :loading="saving"
          data-testid="category-submit-button"
        />
      </div>
    </form>
  </Dialog>
</template>
