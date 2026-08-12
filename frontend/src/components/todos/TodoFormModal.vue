<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import type { Todo } from '@/stores/todos'

const props = defineProps<{
  visible: boolean
  todo?: Todo | null
  saving?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [payload: { title: string; description: string }]
}>()

const title = ref('')
const description = ref('')

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      title.value = props.todo?.title ?? ''
      description.value = props.todo?.description ?? ''
    }
  },
)

function close() {
  emit('update:visible', false)
}

function onSubmit() {
  const value = title.value.trim()
  if (!value) return
  emit('submit', { title: value, description: description.value.trim() })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="todo ? 'Edit todo' : 'New todo'"
    :style="{ width: '28rem' }"
    :draggable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-muted-foreground">Title</span>
        <InputText v-model="title" autofocus required fluid />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-muted-foreground">Description</span>
        <Textarea v-model="description" rows="3" fluid />
      </label>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <div class="flex justify-end gap-2">
        <Button type="button" text severity="secondary" label="Cancel" @click="close" />
        <Button type="submit" :label="todo ? 'Save' : 'Add'" :loading="saving" />
      </div>
    </form>
  </Dialog>
</template>
