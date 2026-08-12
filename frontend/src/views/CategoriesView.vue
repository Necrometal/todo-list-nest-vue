<script setup lang="ts">
import CategoryFormModal from '@/components/categories/CategoryFormModal.vue'
import CategoryList from '@/components/categories/CategoryList.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import type { Category } from '@/stores/categories'
import { useCategoriesStore } from '@/stores/categories'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { onMounted, ref } from 'vue'

const categoriesStore = useCategoriesStore()

const modalVisible = ref(false)
const editingCategory = ref<Category | null>(null)
const saving = ref(false)
const formError = ref('')

onMounted(() => {
  void categoriesStore.fetchCategories()
})

function openCreate() {
  editingCategory.value = null
  formError.value = ''
  modalVisible.value = true
}

function openEdit(category: Category) {
  editingCategory.value = category
  formError.value = ''
  modalVisible.value = true
}

async function onSubmit(payload: { name: string; color: string }) {
  saving.value = true
  formError.value = ''
  try {
    if (editingCategory.value) {
      await categoriesStore.updateCategory(editingCategory.value.id, payload)
    } else {
      await categoriesStore.createCategory(payload)
    }
    modalVisible.value = false
  } catch {
    formError.value = editingCategory.value
      ? 'Could not save changes'
      : 'Could not add that category'
  } finally {
    saving.value = false
  }
}

async function onDelete(category: Category) {
  await categoriesStore.deleteCategory(category.id)
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-foreground">Categories</h1>
        <Button
          icon="pi pi-plus"
          label="New Category"
          data-testid="new-category-button"
          @click="openCreate"
        />
      </div>

      <Message v-if="categoriesStore.error" severity="error" :closable="false">{{
        categoriesStore.error
      }}</Message>

      <CategoryList
        :categories="categoriesStore.categories"
        :loading="categoriesStore.loading"
        @edit="openEdit"
        @delete="onDelete"
      />
    </div>

    <CategoryFormModal
      v-model:visible="modalVisible"
      :category="editingCategory"
      :saving="saving"
      :error="formError"
      @submit="onSubmit"
    />
  </AppLayout>
</template>
