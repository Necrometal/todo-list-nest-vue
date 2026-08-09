<script setup lang="ts">
import { ref } from 'vue'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'

const emit = defineEmits<{ add: [title: string] }>()

const title = ref('')
const submitting = ref(false)

async function onSubmit() {
  const value = title.value.trim()
  if (!value || submitting.value) return
  submitting.value = true
  try {
    emit('add', value)
    title.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <IconField class="w-full">
      <InputIcon class="pi pi-plus" />
      <InputText
        v-model="title"
        placeholder="Add a todo and press Enter"
        class="text-base"
        fluid
        :disabled="submitting"
      />
    </IconField>
  </form>
</template>
