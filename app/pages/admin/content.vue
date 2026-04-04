<template>
  <NuxtLayout name="admin">
    <!-- Content Management Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]">
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Categories Tab -->
    <div v-if="activeTab === 'categories'">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Categories</h2>
          <p class="text-gray-600 dark:text-gray-400">Manage mentoring categories</p>
        </div>
        <UButton icon="heroicons:plus" @click="() => { resetCategoryForm(); showCategoryModal = true; }">
          Add Category
        </UButton>
      </div>

      <!-- Error Display -->
      <div v-if="error"
        class="mb-6 px-6 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                {{ error }}
              </div>
            </div>
          </div>
          <button @click="fetchCategories()"
            class="ml-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span class="ml-2 text-gray-600 dark:text-gray-400">Loading categories...</span>
        </div>
      </div>

      <!-- Categories Table -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mentors
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="category in categories" :key="category.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <Icon :name="category.icon" class="w-5 h-5 text-gray-400 mr-3" />
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ category.name }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ category.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ category.mentorCount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge :color="category.active ? 'success' : 'neutral'" variant="soft">
                  {{ category.active ? 'Active' : 'Inactive' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <UDropdownMenu :items="getCategoryActions(category)">
                  <UButton variant="ghost" icon="heroicons:ellipsis-horizontal" />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Skills Tab -->
    <div v-if="activeTab === 'skills'">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Skills</h2>
          <p class="text-gray-600 dark:text-gray-400">Manage available skills</p>
        </div>
        <UButton icon="heroicons:plus" @click="() => { resetSkillForm(); showSkillModal = true; }">
          Add Skill
        </UButton>
      </div>

      <!-- Error Display -->
      <div v-if="error"
        class="mb-6 px-6 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                {{ error }}
              </div>
            </div>
          </div>
          <button @click="fetchSkills()"
            class="ml-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span class="ml-2 text-gray-600 dark:text-gray-400">Loading skills...</span>
        </div>
      </div>

      <!-- Skills Content -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="mb-4">
          <UInput v-model="skillSearchQuery" placeholder="Search skills..." icon="heroicons:magnifying-glass" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="skill in filteredSkills" :key="skill.id"
            class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ skill.name }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ skill.mentorCount }} mentors
              </p>
            </div>
            <UDropdownMenu :items="getSkillActions(skill)">
              <UButton variant="ghost" icon="heroicons:ellipsis-horizontal" size="sm" />
            </UDropdownMenu>
          </div>
        </div>
      </div>
    </div>


    <!-- Category Modal -->
    <UModal v-model:open="showCategoryModal" :title="editingCategory ? 'Edit Category' : 'Add Category'">
      <template #body>
        <UForm :state="newCategory" @submit="saveCategory" class="space-y-4">
          <UFormField label="Category Name" required>
            <UInput v-model="newCategory.name" placeholder="e.g. Software Development" class="w-full" />
          </UFormField>

          <UFormField label="Description" required>
            <UTextarea v-model="newCategory.description" placeholder="Brief description of this category"
              class="w-full" />
          </UFormField>
        </UForm>
      </template>

      <template #footer="{ close }">
        <div class="w-full flex justify-end gap-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton @click="saveCategory" :loading="isSavingCategory">{{ editingCategory ? 'Update Category' : 'Save Category' }}</UButton>
        </div>
      </template>
    </UModal>

    <!-- Skill Modal -->
    <UModal v-model:open="showSkillModal" :title="editingSkill ? 'Edit Skill' : 'Add Skill'">
      <template #body>
        <UForm :state="newSkill" @submit="saveSkill" class="space-y-4">
          <UFormField label="Skill Name" required>
            <UInput v-model="newSkill.name" placeholder="e.g. JavaScript" class="w-full" />
          </UFormField>

          <UFormField :label="`Category (${categoryOptions.length - 1} available)`">
            <select v-model="newSkill.categoryId" class="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700">
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </UFormField>
        </UForm>
      </template>

      <template #footer="{ close }">
        <div class="w-full flex justify-end gap-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton @click="saveSkill" :loading="isSavingSkill">{{ editingSkill ? 'Update Skill' : 'Save Skill' }}</UButton>
        </div>
      </template>
    </UModal>

    <!-- Confirmation Modal -->
    <UModal v-model:open="showConfirmModal" :title="confirmTitle">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ confirmMessage }}
        </p>
      </template>

      <template #footer="{ close }">
        <div class="w-full flex justify-end gap-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton :color="confirmButtonColor" @click="handleConfirm">
            {{ confirmButtonText }}
          </UButton>
        </div>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: false
})

// Use admin content composable
const {
  categories,
  skills,
  filteredSkills,
  isLoading,
  error,
  skillSearchQuery,
  showCategoryModal,
  showSkillModal,
  isSavingCategory,
  isSavingSkill,
  newCategory,
  newSkill,
  editingCategory,
  editingSkill,
  categoryOptions,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
  resetCategoryForm,
  fetchSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  resetSkillForm,
} = useAdminContent()

// Local state
const activeTab = ref('categories')

// Tabs
const tabs = [
  { id: 'categories', name: 'Categories' },
  { id: 'skills', name: 'Skills' }
]

// Confirmation Modal State
const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmButtonText = ref('')
const confirmButtonColor = ref('primary')
const confirmAction = ref<(() => void) | null>(null)

const openConfirmModal = (options: {
  title: string,
  message: string,
  buttonText: string,
  buttonColor?: string,
  action: () => void
}) => {
  confirmTitle.value = options.title
  confirmMessage.value = options.message
  confirmButtonText.value = options.buttonText
  confirmButtonColor.value = options.buttonColor || 'primary'
  confirmAction.value = options.action
  showConfirmModal.value = true
}

const handleConfirm = () => {
  if (confirmAction.value) {
    confirmAction.value()
  }
  showConfirmModal.value = false
}

// Methods
const getCategoryActions = (category: any) => [
  [{
    label: 'Edit',
    icon: 'heroicons:pencil',
    onSelect: () => editCategory(category)
  }],
  [{
    label: category.active ? 'Deactivate' : 'Activate',
    icon: category.active ? 'heroicons:pause' : 'heroicons:play',
    onSelect: () => {
      if (category.active) {
        openConfirmModal({
          title: 'Deactivate Category',
          message: `Are you sure you want to deactivate the category "${category.name}"? It will no longer be visible to users.`,
          buttonText: 'Deactivate',
          buttonColor: 'warning',
          action: () => toggleCategory(category)
        })
      } else {
        toggleCategory(category)
      }
    }
  }],
  [{
    label: 'Delete',
    icon: 'heroicons:trash',
    onSelect: () => {
      openConfirmModal({
        title: 'Delete Category',
        message: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`,
        buttonText: 'Delete',
        buttonColor: 'error',
        action: () => deleteCategory(category.id)
      })
    }
  }]
]

const getSkillActions = (skill: any) => [
  [{
    label: 'Edit',
    icon: 'heroicons:pencil',
    onSelect: () => editSkill(skill)
  }],
  [{
    label: 'Delete',
    icon: 'heroicons:trash',
    onSelect: () => {
      openConfirmModal({
        title: 'Delete Skill',
        message: `Are you sure you want to delete the skill "${skill.name}"? This action cannot be undone.`,
        buttonText: 'Delete',
        buttonColor: 'error',
        action: () => deleteSkill(skill.id)
      })
    }
  }]
]

const saveCategory = async () => {
  await createCategory(newCategory)
}

const saveSkill = async () => {
  await createSkill(newSkill)
}

const editCategory = (category: any) => {
  editingCategory.value = category
  Object.assign(newCategory, {
    name: category.name,
    description: category.description,
    icon: category.icon
  })
  showCategoryModal.value = true
}

const editSkill = (skill: any) => {
  editingSkill.value = skill
  Object.assign(newSkill, {
    name: skill.name,
    categoryId: skill.categoryId || ''
  })
  showSkillModal.value = true
}

// Initial data fetch
onMounted(() => {
  fetchCategories()
  fetchSkills()
})

// SEO
useSeoMeta({
  title: 'Content Management - Admin Dashboard',
  description: 'Manage categories and skills'
})
</script>
