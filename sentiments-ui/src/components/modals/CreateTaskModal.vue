<template>
  <Modal
    :is-open="isOpen"
    :title="isEditing ? 'Edit Task' : 'Create New Task'"
    size="xl"
    :icon="ListTodo"
    icon-class="bg-blue-100"
    @close="emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Task Title -->
      <div class="space-y-2">
        <label for="title" class="block text-sm font-medium text-gray-700">
          Task Title *
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="Enter task title..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxlength="100"
          required
        />
        <div class="text-xs text-gray-500 text-right">{{ form.title.length }}/100 characters</div>
      </div>

      <!-- Task Description -->
      <div class="space-y-2">
        <label for="description" class="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Describe the task in detail..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
          maxlength="500"
          required
        ></textarea>
        <div class="text-xs text-gray-500 text-right">{{ form.description.length }}/500 characters</div>
      </div>

      <!-- Priority and Category Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Priority -->
        <div class="space-y-2">
          <label for="priority" class="block text-sm font-medium text-gray-700">
            Priority *
          </label>
          <select
            id="priority"
            v-model="form.priority"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select priority</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>

        <!-- Category -->
        <div class="space-y-2">
          <label for="category" class="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <div class="flex gap-2">
            <select
              id="category"
              v-model="form.category"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select or enter category</option>
              <option v-for="category in predefinedCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <Button
              type="button"
              @click="showCustomCategory = !showCustomCategory"
              variant="outline"
              class="px-3"
            >
              <Plus class="w-4 h-4" />
            </Button>
          </div>
          <input
            v-if="showCustomCategory"
            v-model="customCategory"
            type="text"
            placeholder="Enter custom category..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
            maxlength="50"
            @blur="addCustomCategory"
            @keyup.enter="addCustomCategory"
          />
        </div>
      </div>

      <!-- Due Date and Time -->
      <div class="space-y-2">
        <label for="dueDate" class="block text-sm font-medium text-gray-700">
          Due Date & Time *
        </label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            id="dueDate"
            v-model="form.dueDate"
            type="date"
            :min="minDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            v-model="form.dueTime"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div class="text-xs text-gray-500">
          Task will be due on {{ formatPreviewDate() }}
        </div>
      </div>

      <!-- Estimated Hours -->
      <div class="space-y-2">
        <label for="estimatedHours" class="block text-sm font-medium text-gray-700">
          Estimated Hours (Optional)
        </label>
        <input
          id="estimatedHours"
          v-model.number="form.estimatedHours"
          type="number"
          min="0.25"
          max="40"
          step="0.25"
          placeholder="e.g., 2.5"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div class="text-xs text-gray-500">
          Help track time estimates vs actual time spent
        </div>
      </div>

      <!-- Tags -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Tags (Optional)
        </label>
        <div class="flex flex-wrap gap-2 mb-2">
          <Badge
            v-for="(tag, index) in form.tags"
            :key="index"
            class="bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors"
            @click="removeTag(index)"
          >
            {{ tag }}
            <X class="w-3 h-3 ml-1" />
          </Badge>
        </div>
        <div class="flex gap-2">
          <input
            v-model="newTag"
            type="text"
            placeholder="Add a tag..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxlength="20"
            @keyup.enter="addTag"
          />
          <Button
            type="button"
            @click="addTag"
            variant="outline"
            class="px-4"
          >
            Add
          </Button>
        </div>
        <div class="text-xs text-gray-500">
          Use tags to organize and filter your tasks
        </div>
      </div>

      <!-- Quick Actions Preset -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Quick Presets
        </label>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <Button
            v-for="preset in taskPresets"
            :key="preset.name"
            type="button"
            @click="applyPreset(preset)"
            variant="outline"
            size="sm"
            class="text-xs p-2 text-left"
          >
            <div>
              <div class="font-medium">{{ preset.name }}</div>
              <div class="text-gray-500">{{ preset.description }}</div>
            </div>
          </Button>
        </div>
      </div>

      <!-- Task Info Summary -->
      <div v-if="form.title && form.priority && form.dueDate" class="bg-blue-50 p-4 rounded-lg">
        <h4 class="font-medium text-blue-900 mb-2">Task Summary</h4>
        <div class="text-sm text-blue-800 space-y-1">
          <p><strong>Title:</strong> {{ form.title }}</p>
          <p><strong>Priority:</strong> {{ form.priority.toUpperCase() }}</p>
          <p><strong>Category:</strong> {{ form.category || 'Not specified' }}</p>
          <p><strong>Due:</strong> {{ formatPreviewDate() }}</p>
          <p v-if="form.estimatedHours"><strong>Estimated Time:</strong> {{ form.estimatedHours }} hours</p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button
          type="button"
          @click="emit('close')"
          variant="outline"
          class="px-6"
        >
          Cancel
        </Button>
        <Button
          type="button"
          @click="resetForm"
          variant="outline"
          class="px-4"
        >
          Reset
        </Button>
        <Button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          class="min-w-[120px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <div v-if="isSubmitting" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </div>
          <div v-else class="flex items-center gap-2">
            <Save class="w-4 h-4" />
            {{ isEditing ? 'Update Task' : 'Create Task' }}
          </div>
        </Button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { ListTodo, Plus, Save, X } from 'lucide-vue-next'

// Props
interface Props {
  isOpen: boolean
  task?: any
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
})

// Emits
const emit = defineEmits<{
  close: []
  save: [taskData: any]
}>()

// Reactive state
const isSubmitting = ref(false)
const showCustomCategory = ref(false)
const customCategory = ref('')
const newTag = ref('')

// Form data
const form = ref({
  title: '',
  description: '',
  priority: '',
  category: '',
  dueDate: '',
  dueTime: '',
  estimatedHours: null as number | null,
  tags: [] as string[]
})

// Predefined categories
const predefinedCategories = [
  'Patient Care',
  'Administration',
  'Documentation',
  'Training',
  'Maintenance',
  'Meeting',
  'Research',
  'Quality Assurance',
  'Communication',
  'Planning'
]

// Task presets for quick creation
const taskPresets = [
  {
    name: 'Patient Review',
    description: 'Review patient charts',
    priority: 'high',
    category: 'Patient Care',
    estimatedHours: 1,
    tags: ['review', 'patient']
  },
  {
    name: 'Team Meeting',
    description: 'Prepare for team meeting',
    priority: 'medium',
    category: 'Meeting',
    estimatedHours: 0.5,
    tags: ['meeting', 'preparation']
  },
  {
    name: 'Documentation',
    description: 'Update documentation',
    priority: 'low',
    category: 'Documentation',
    estimatedHours: 2,
    tags: ['documentation', 'update']
  },
  {
    name: 'Equipment Check',
    description: 'Equipment maintenance',
    priority: 'high',
    category: 'Maintenance',
    estimatedHours: 1.5,
    tags: ['equipment', 'maintenance']
  },
  {
    name: 'Training Session',
    description: 'Attend training session',
    priority: 'medium',
    category: 'Training',
    estimatedHours: 3,
    tags: ['training', 'learning']
  },
  {
    name: 'Quality Review',
    description: 'Quality assurance review',
    priority: 'urgent',
    category: 'Quality Assurance',
    estimatedHours: 2,
    tags: ['quality', 'review']
  }
]

// Computed properties
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return form.value.title.trim() &&
         form.value.description.trim() &&
         form.value.priority &&
         form.value.category &&
         form.value.dueDate &&
         form.value.dueTime
})

// Methods
const formatPreviewDate = () => {
  if (!form.value.dueDate || !form.value.dueTime) return 'Please select date and time'

  const dateTime = new Date(`${form.value.dueDate}T${form.value.dueTime}`)
  return dateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const addCustomCategory = () => {
  if (customCategory.value.trim()) {
    form.value.category = customCategory.value.trim()
    customCategory.value = ''
    showCustomCategory.value = false
  }
}

const addTag = () => {
  const tag = newTag.value.trim().toLowerCase()
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 5) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

const applyPreset = (preset: any) => {
  form.value.priority = preset.priority
  form.value.category = preset.category
  form.value.estimatedHours = preset.estimatedHours
  form.value.tags = [...preset.tags]

  if (!form.value.title) {
    form.value.title = preset.name
  }
  if (!form.value.description) {
    form.value.description = preset.description
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    priority: '',
    category: '',
    dueDate: '',
    dueTime: '',
    estimatedHours: null,
    tags: []
  }
  newTag.value = ''
  customCategory.value = ''
  showCustomCategory.value = false
}

const populateForm = () => {
  if (props.task && props.isEditing) {
    const dueDate = new Date(props.task.dueDate)
    form.value = {
      title: props.task.title || '',
      description: props.task.description || '',
      priority: props.task.priority || '',
      category: props.task.category || '',
      dueDate: dueDate.toISOString().split('T')[0],
      dueTime: dueDate.toTimeString().slice(0, 5),
      estimatedHours: props.task.estimatedHours || null,
      tags: props.task.tags || []
    }
  } else {
    resetForm()
    // Set default due date to tomorrow at 9 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    form.value.dueDate = tomorrow.toISOString().split('T')[0]
    form.value.dueTime = '09:00'
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    // Combine date and time for dueDate
    const dueDateTime = new Date(`${form.value.dueDate}T${form.value.dueTime}`)

    const taskData = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      priority: form.value.priority,
      category: form.value.category,
      dueDate: dueDateTime.toISOString(),
      estimatedHours: form.value.estimatedHours,
      tags: form.value.tags
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('save', taskData)
  } catch (error) {
    console.error('Error saving task:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    populateForm()
  }
})

// Lifecycle
onMounted(() => {
  if (props.isOpen) {
    populateForm()
  }
})
</script>

<style scoped>
/* Custom styles for form elements */
input:focus,
select:focus,
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
