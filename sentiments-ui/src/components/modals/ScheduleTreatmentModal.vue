<template>
  <Modal
    :is-open="isOpen"
    :title="patient ? `Schedule Treatment for ${patient.name}` : 'Schedule Treatment'"
    size="lg"
    :icon="Calendar"
    icon-class="bg-green-100"
    @close="emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Patient Information Display -->
      <div v-if="patient" class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-medium text-gray-900 mb-2">Patient Information</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Name:</span>
            <span class="ml-2 font-medium">{{ patient.name }}</span>
          </div>
          <div>
            <span class="text-gray-500">Department:</span>
            <span class="ml-2 font-medium">{{ patient.department }}</span>
          </div>
          <div>
            <span class="text-gray-500">Status:</span>
            <Badge :variant="getStatusVariant(patient.status)" class="ml-2">
              {{ patient.status }}
            </Badge>
          </div>
          <div>
            <span class="text-gray-500">Last Visit:</span>
            <span class="ml-2 font-medium">{{ formatDate(patient.lastVisit) }}</span>
          </div>
        </div>
      </div>

      <!-- Treatment Details -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Treatment Details</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="treatmentType" class="block text-sm font-medium text-gray-700 mb-1">
              Treatment Type *
            </label>
            <select
              id="treatmentType"
              v-model="form.treatmentType"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Treatment Type</option>
              <option value="consultation">Consultation</option>
              <option value="procedure">Medical Procedure</option>
              <option value="surgery">Surgery</option>
              <option value="therapy">Therapy</option>
              <option value="checkup">Follow-up Checkup</option>
              <option value="lab_work">Lab Work</option>
              <option value="imaging">Imaging</option>
              <option value="emergency">Emergency Treatment</option>
            </select>
          </div>
          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
              Priority Level *
            </label>
            <select
              id="priority"
              v-model="form.priority"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Scheduling Information -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Schedule Information</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="scheduledDate" class="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date & Time *
            </label>
            <input
              id="scheduledDate"
              v-model="form.scheduledDate"
              type="datetime-local"
              required
              :min="minDateTime"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration (minutes) *
            </label>
            <input
              id="duration"
              v-model.number="form.duration"
              type="number"
              min="15"
              max="480"
              step="15"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="60"
            />
          </div>
          <div>
            <label for="assignedDoctor" class="block text-sm font-medium text-gray-700 mb-1">
              Assigned Doctor *
            </label>
            <select
              id="assignedDoctor"
              v-model="form.assignedDoctor"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Doctor</option>
              <option value="dr-smith">Dr. Sarah Smith</option>
              <option value="dr-johnson">Dr. Michael Johnson</option>
              <option value="dr-williams">Dr. Emily Williams</option>
              <option value="dr-brown">Dr. David Brown</option>
              <option value="dr-davis">Dr. Lisa Davis</option>
              <option value="dr-miller">Dr. James Miller</option>
            </select>
          </div>
          <div>
            <label for="room" class="block text-sm font-medium text-gray-700 mb-1">
              Room/Location
            </label>
            <select
              id="room"
              v-model="form.room"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Auto-assign</option>
              <option value="room-101">Room 101 - General</option>
              <option value="room-102">Room 102 - Surgery</option>
              <option value="room-201">Room 201 - Cardiology</option>
              <option value="room-202">Room 202 - Neurology</option>
              <option value="lab-a">Lab A - Blood Work</option>
              <option value="imaging-1">Imaging Suite 1</option>
              <option value="er-1">Emergency Room 1</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Treatment Description -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Treatment Description</h4>
        <div class="space-y-4">
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Treatment Description *
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Describe the treatment plan, procedures, or goals for this appointment"
            ></textarea>
          </div>
          <div>
            <label for="preparation" class="block text-sm font-medium text-gray-700 mb-1">
              Pre-treatment Preparation
            </label>
            <textarea
              id="preparation"
              v-model="form.preparation"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Any special preparations required before the treatment (e.g., fasting, medication adjustments)"
            ></textarea>
          </div>
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Any additional notes or special considerations"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Notification Settings</h4>
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="form.sendReminder"
              type="checkbox"
              class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm text-gray-700">Send appointment reminder to patient</span>
          </label>
          <div v-if="form.sendReminder" class="ml-6 space-y-2">
            <label class="flex items-center">
              <input
                v-model="form.reminderEmail"
                type="checkbox"
                class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <span class="ml-2 text-sm text-gray-600">Email reminder</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.reminderSMS"
                type="checkbox"
                class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <span class="ml-2 text-sm text-gray-600">SMS reminder</span>
            </label>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <Button
        @click="handleSubmit"
        :disabled="isSubmitting || !isFormValid"
        class="bg-green-600 hover:bg-green-700"
      >
        <div v-if="isSubmitting" class="flex items-center">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Scheduling...
        </div>
        <div v-else class="flex items-center">
          <Calendar class="w-4 h-4 mr-2" />
          Schedule Treatment
        </div>
      </Button>
      <Button @click="emit('close')" variant="outline" class="mr-3" :disabled="isSubmitting">
        Cancel
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { Calendar } from 'lucide-vue-next'

interface Patient {
  _id: string
  name: string
  email: string
  department: string
  status: 'active' | 'recovering' | 'stable' | 'critical'
  lastVisit: string
}

interface TreatmentSchedule {
  treatmentType: string
  priority: string
  scheduledDate: string
  duration: number
  assignedDoctor: string
  room: string
  description: string
  preparation: string
  notes: string
  sendReminder: boolean
  reminderEmail: boolean
  reminderSMS: boolean
}

interface Props {
  isOpen: boolean
  patient: Patient | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  schedule: [treatment: TreatmentSchedule & { patientId: string }]
}>()

const toast = useToast()
const isSubmitting = ref(false)
const minDateTime = ref('')

// Form data
const form = ref({
  treatmentType: '',
  priority: '',
  scheduledDate: '',
  duration: 60,
  assignedDoctor: '',
  room: '',
  description: '',
  preparation: '',
  notes: '',
  sendReminder: true,
  reminderEmail: true,
  reminderSMS: false
})

// Form validation
const isFormValid = computed(() => {
  return form.value.treatmentType &&
         form.value.priority &&
         form.value.scheduledDate &&
         form.value.duration > 0 &&
         form.value.assignedDoctor &&
         form.value.description.trim()
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

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'critical': return 'destructive'
    case 'active': return 'default'
    case 'recovering': return 'secondary'
    case 'stable': return 'outline'
    default: return 'default'
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || !props.patient) return

  isSubmitting.value = true

  try {
    const treatmentData: TreatmentSchedule & { patientId: string } = {
      ...form.value,
      patientId: props.patient._id
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    emit('schedule', treatmentData)
    toast.success(`Treatment scheduled successfully for ${props.patient.name}`)
  } catch (error) {
    toast.error('Failed to schedule treatment')
  } finally {
    isSubmitting.value = false
  }
}

// Set minimum date to current time
onMounted(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  minDateTime.value = now.toISOString().slice(0, 16)
})
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
