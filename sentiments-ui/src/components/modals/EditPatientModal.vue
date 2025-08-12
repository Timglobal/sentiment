<template>
  <Modal
    :is-open="isOpen"
    :title="patient ? `Edit ${patient.name}` : 'Edit Patient'"
    size="lg"
    :icon="Edit"
    icon-class="bg-blue-100"
    @close="emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter patient's full name"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="patient@example.com"
            />
          </div>
          <div>
            <label for="department" class="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              id="department"
              v-model="form.department"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Department</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Oncology">Oncology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Emergency">Emergency</option>
              <option value="Surgery">Surgery</option>
              <option value="Internal Medicine">Internal Medicine</option>
            </select>
          </div>
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              Current Status *
            </label>
            <select
              id="status"
              v-model="form.status"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="recovering">Recovering</option>
              <option value="stable">Stable</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Appointment Information -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Appointment Information</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="lastVisit" class="block text-sm font-medium text-gray-700 mb-1">
              Last Visit
            </label>
            <input
              id="lastVisit"
              v-model="form.lastVisit"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="nextAppointment" class="block text-sm font-medium text-gray-700 mb-1">
              Next Appointment
            </label>
            <input
              id="nextAppointment"
              v-model="form.nextAppointment"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Treatment Plan -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Treatment Plan</h4>
        <div class="space-y-4">
          <div>
            <label for="medications" class="block text-sm font-medium text-gray-700 mb-1">
              Current Medications
            </label>
            <textarea
              id="medications"
              v-model="form.medications"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter medications, one per line"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">Enter each medication on a separate line</p>
          </div>
          <div>
            <label for="instructions" class="block text-sm font-medium text-gray-700 mb-1">
              Treatment Instructions
            </label>
            <textarea
              id="instructions"
              v-model="form.instructions"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter treatment instructions and notes"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Medical Notes -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Additional Notes</h4>
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
            Medical Notes
          </label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any additional medical notes or observations"
          ></textarea>
        </div>
      </div>
    </form>

    <template #footer>
      <Button
        @click="handleSubmit"
        :disabled="isSubmitting || !isFormValid"
        class="bg-blue-600 hover:bg-blue-700"
      >
        <div v-if="isSubmitting" class="flex items-center">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Saving...
        </div>
        <div v-else class="flex items-center">
          <Save class="w-4 h-4 mr-2" />
          Save Changes
        </div>
      </Button>
      <Button @click="emit('close')" variant="outline" class="mr-3" :disabled="isSubmitting">
        Cancel
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { Edit, Save } from 'lucide-vue-next'

interface Patient {
  _id: string
  name: string
  email: string
  department: string
  status: 'active' | 'recovering' | 'stable' | 'critical'
  lastVisit: string
  nextAppointment?: string
  medicalHistory?: Array<{
    date: string
    condition?: string
    notes?: string
    description?: string
  }>
  treatmentPlan?: {
    medications?: string[]
    instructions?: string
  }
}

interface Props {
  isOpen: boolean
  patient: Patient | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [patient: Patient]
}>()

const toast = useToast()
const isSubmitting = ref(false)

// Form data
const form = ref({
  name: '',
  email: '',
  department: '',
  status: '' as 'active' | 'recovering' | 'stable' | 'critical' | '',
  lastVisit: '',
  nextAppointment: '',
  medications: '',
  instructions: '',
  notes: ''
})

// Form validation
const isFormValid = computed(() => {
  return form.value.name.trim() &&
         form.value.email.trim() &&
         form.value.department &&
         form.value.status
})

// Watch for patient changes to populate form
watch(
  () => props.patient,
  (newPatient) => {
    if (newPatient) {
      form.value = {
        name: newPatient.name,
        email: newPatient.email,
        department: newPatient.department,
        status: newPatient.status,
        lastVisit: formatDateForInput(newPatient.lastVisit),
        nextAppointment: newPatient.nextAppointment ? formatDateForInput(newPatient.nextAppointment) : '',
        medications: newPatient.treatmentPlan?.medications?.join('\n') || '',
        instructions: newPatient.treatmentPlan?.instructions || '',
        notes: ''
      }
    }
  },
  { immediate: true }
)

// Helper functions
const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

const handleSubmit = async () => {
  if (!isFormValid.value || !props.patient) return

  isSubmitting.value = true

  try {
    // Prepare updated patient data
    const updatedPatient: Patient = {
      ...props.patient,
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      department: form.value.department,
      status: form.value.status as Patient['status'],
      lastVisit: form.value.lastVisit ? new Date(form.value.lastVisit).toISOString() : props.patient.lastVisit,
      nextAppointment: form.value.nextAppointment ? new Date(form.value.nextAppointment).toISOString() : undefined,
      treatmentPlan: {
        medications: form.value.medications.trim() ? form.value.medications.split('\n').map(m => m.trim()).filter(m => m) : [],
        instructions: form.value.instructions.trim()
      }
    }

    // Add medical note if provided
    if (form.value.notes.trim()) {
      const newNote = {
        date: new Date().toISOString(),
        notes: form.value.notes.trim()
      }
      updatedPatient.medicalHistory = [...(props.patient.medicalHistory || []), newNote]
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('save', updatedPatient)
    toast.success('Patient updated successfully!')
  } catch (error) {
    toast.error('Failed to update patient')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
