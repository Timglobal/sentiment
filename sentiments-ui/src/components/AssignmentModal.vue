<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ assignment ? 'Edit Assignment' : 'Create New Assignment' }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Patient and Worker Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Patient Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Select Patient <span class="text-red-500">*</span>
              </label>
              <SelectPatient
                :selected-patient="selectedPatient"
                trigger-label="Select Patient"
                placeholder="Search and select a patient"
                @patient-select="handlePatientSelection"
              />
            </div>

            <!-- Worker Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Select Worker <span class="text-red-500">*</span>
              </label>
              <SelectWorker
                :selected-worker="selectedWorker"
                trigger-label="Select Worker"
                placeholder="Search and select a worker"
                role-filter="staff"
                @worker-select="handleWorkerSelection"
              />
            </div>
          </div>

          <!-- Priority and Department -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Priority Level -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Priority Level
              </label>
              <select
                v-model="form.priority"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>

            <!-- Department (Auto-filled from patient selection) -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                v-model="selectedDepartment"
                type="text"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Select a patient first"
              />
            </div>
          </div>

          <!-- Assignment Duration -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Start Date <span class="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                v-model="form.startDate"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                End Date (Optional)
              </label>
              <input
                type="datetime-local"
                v-model="form.endDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Assignment Notes -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Assignment Notes
            </label>
            <textarea
              v-model="form.notes"
              placeholder="Add any special instructions, care requirements, or notes for this assignment..."
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <!-- Assignment Preview (if editing) -->
          <div v-if="assignment" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="text-sm font-medium text-blue-900 mb-2">Current Assignment</h4>
            <div class="text-sm text-blue-800 space-y-1">
              <p><strong>Patient:</strong> {{ assignment.patientName }}</p>
              <p><strong>Worker:</strong> {{ assignment.workerName }}</p>
              <p><strong>Status:</strong> {{ assignment.status }}</p>
              <p><strong>Created:</strong> {{ formatDate(assignment.createdAt) }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              @click="$emit('close')"
              variant="outline"
              class="flex-1 sm:flex-none sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              :disabled="!isFormValid || isSubmitting"
              class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isSubmitting" class="flex items-center justify-center">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {{ assignment ? 'Updating...' : 'Creating...' }}
              </div>
              <div v-else class="flex items-center justify-center">
                <Save class="w-4 h-4 mr-2" />
                {{ assignment ? 'Update Assignment' : 'Create Assignment' }}
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Button from '@/components/ui/Button.vue'
import SelectWorker from '@/components/SelectWorker.vue'
import SelectPatient from '@/components/SelectPatient.vue'
import { X, Save } from 'lucide-vue-next'

// Props
interface Props {
  isOpen: boolean
  assignment?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  submit: [data: any]
}>()

// Reactive state
const isSubmitting = ref(false)
const selectedWorkerRef = ref<any>(null)
const selectedPatientRef = ref<any>(null)

const form = ref({
  patientId: '',
  workerId: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  notes: '',
  startDate: new Date().toISOString().slice(0, 16),
  endDate: ''
})

// Computed
const selectedPatient = computed(() => {
  return selectedPatientRef.value
})

const selectedWorker = computed(() => {
  return selectedWorkerRef.value
})

const selectedDepartment = computed(() => {
  return selectedPatient.value?.department || ''
})

const isFormValid = computed(() => {
  return form.value.patientId && form.value.workerId && form.value.startDate
})

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const resetForm = () => {
  form.value = {
    patientId: '',
    workerId: '',
    priority: 'medium',
    notes: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: ''
  }
  selectedWorkerRef.value = null
  selectedPatientRef.value = null
}

// Handle patient selection from SelectPatient component
const handlePatientSelection = (patient: any) => {
  selectedPatientRef.value = patient
  form.value.patientId = patient?._id || ''
}

// Handle worker selection from SelectWorker component
const handleWorkerSelection = (worker: any) => {
  selectedWorkerRef.value = worker
  form.value.workerId = worker?._id || ''
}

const populateForm = () => {
  if (props.assignment) {
    form.value = {
      patientId: props.assignment.patientId,
      workerId: props.assignment.workerId,
      priority: props.assignment.priority,
      notes: props.assignment.notes || '',
      startDate: props.assignment.startDate.slice(0, 16),
      endDate: props.assignment.endDate ? props.assignment.endDate.slice(0, 16) : ''
    }

    // Set the selected patient for editing mode
    selectedPatientRef.value = {
      _id: props.assignment.patientId,
      name: props.assignment.patientName,
      email: props.assignment.patientEmail || '',
      role: 'patient',
      department: props.assignment.department
    }

    // Set the selected worker for editing mode
    selectedWorkerRef.value = {
      _id: props.assignment.workerId,
      name: props.assignment.workerName,
      email: props.assignment.workerEmail || '',
      role: props.assignment.workerRole,
      department: props.assignment.department
    }
  } else {
    resetForm()
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    isSubmitting.value = true

    const patient = selectedPatient.value
    const worker = selectedWorker.value

    if (!patient || !worker) {
      throw new Error('Please select both patient and worker')
    }

    const assignmentData = {
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      workerId: worker._id,
      workerName: worker.name,
      workerRole: worker.role,
      department: patient.department,
      priority: form.value.priority,
      notes: form.value.notes,
      startDate: form.value.startDate,
      endDate: form.value.endDate || undefined
    }

    emit('submit', assignmentData)
  } catch (error) {
    console.error('Error submitting assignment:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    populateForm()
  }
})

watch(() => props.assignment, () => {
  if (props.isOpen) {
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
/* Modal enter/leave transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Form focus states */
input:focus, select:focus, textarea:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-2xl {
    max-width: calc(100vw - 2rem);
    margin: 1rem;
  }
}
</style>
