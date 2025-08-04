<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      @click.stop
    >
      <h3 class="text-lg font-semibold mb-4">Edit Worker</h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            v-model="formData.role"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a role</option>
            <option value="staff">Staff</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Department
            <span v-if="formData.role === 'staff'" class="text-red-500">*</span>
            <span v-else class="text-gray-500">(Optional)</span>
          </label>
          <input
            v-model="formData.department"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :required="formData.role === 'staff'"
            placeholder="e.g., Emergency, Cardiology, Radiology"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="formData.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
          <textarea
            v-model="formData.note"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Add any additional notes or comments about this worker..."
          ></textarea>
        </div>

        <div class="flex space-x-3">
          <Button
            type="submit"
            class="flex-1 bg-blue-600 hover:bg-blue-700"
            :disabled="isLoading"
          >
            <div v-if="isLoading" class="flex items-center justify-center">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating...
            </div>
            <span v-else>Update Worker</span>
          </Button>
          <Button
            type="button"
            @click="closeModal"
            variant="outline"
            class="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from '../ui/Button.vue'
import { useToast } from 'vue-toast-notification'
import type { Worker } from '@/services/workerService'

interface Props {
  isOpen: boolean
  worker: Worker | null
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: Worker): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const toast = useToast()

const isLoading = ref(false)
const formData = ref<Worker>({
  _id: '',
  name: '',
  role: 'staff',
  department: '',
  email: '',
  note: '',
  company: '',
  createdAt: '',
  updatedAt: ''
})

const closeModal = () => {
  emit('close')
}

const validateForm = (): boolean => {
  if (!formData.value.name.trim()) {
    toast.error('Name is required')
    return false
  }

  if (!formData.value.email.trim()) {
    toast.error('Email is required')
    return false
  }

  if (!formData.value.role) {
    toast.error('Role is required')
    return false
  }

  if (formData.value.role === 'staff' && !formData.value.department?.trim()) {
    toast.error('Department is required for staff members')
    return false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    toast.error('Please enter a valid email address')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    // Clean up data before sending
    const cleanData: Worker = {
      ...formData.value,
      name: formData.value.name.trim(),
      email: formData.value.email.trim().toLowerCase(),
      department: formData.value.department?.trim() || '',
      note: formData.value.note?.trim() || ''
    }

    emit('submit', cleanData)
    // Modal will be closed by parent component on success
  } catch (error) {
    console.error('Error updating worker:', error)
    toast.error('Failed to update worker')
  } finally {
    isLoading.value = false
  }
}

// Watch for worker prop changes to populate form
watch(() => props.worker, (newWorker) => {
  if (newWorker) {
    formData.value = { ...newWorker }
  }
}, { immediate: true })

// Clear department when role changes to patient
watch(() => formData.value.role, (newRole) => {
  if (newRole === 'patient') {
    formData.value.department = ''
  }
})
</script>
