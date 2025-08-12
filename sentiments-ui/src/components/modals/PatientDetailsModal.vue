<template>
  <Modal
    :is-open="isOpen"
    :title="patient ? `${patient.name} - Patient Details` : 'Patient Details'"
    size="xl"
    :icon="User"
    icon-class="bg-blue-100"
    @close="emit('close')"
  >
    <div v-if="patient" class="space-y-6">
      <!-- Patient Basic Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p class="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">{{ patient.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p class="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">{{ patient.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p class="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">{{ patient.department }}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
            <div class="flex items-center">
              <Badge :class="getStatusBadgeClass(patient.status)">
                {{ patient.status }}
              </Badge>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Visit</label>
            <p class="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">{{ formatDate(patient.lastVisit) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Next Appointment</label>
            <p class="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
              {{ patient.nextAppointment ? formatDate(patient.nextAppointment) : 'Not scheduled' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Medical History -->
      <div class="space-y-3">
        <h4 class="text-lg font-medium text-gray-900 flex items-center">
          <FileText class="w-5 h-5 mr-2 text-gray-600" />
          Medical History
        </h4>
        <div class="bg-gray-50 rounded-lg p-4">
          <div v-if="patient.medicalHistory && patient.medicalHistory.length > 0" class="space-y-3">
            <div
              v-for="(record, index) in patient.medicalHistory"
              :key="index"
              class="bg-white rounded-md p-3 border border-gray-200"
            >
              <div class="flex items-center justify-between mb-2">
                <h5 class="font-medium text-gray-900">{{ record.condition || 'Medical Record' }}</h5>
                <span class="text-sm text-gray-500">{{ formatDate(record.date) }}</span>
              </div>
              <p class="text-sm text-gray-700">{{ record.notes || record.description || 'No additional notes' }}</p>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <FileText class="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p class="text-gray-500">No medical history available</p>
          </div>
        </div>
      </div>

      <!-- Treatment Plan -->
      <div v-if="patient.treatmentPlan" class="space-y-3">
        <h4 class="text-lg font-medium text-gray-900 flex items-center">
          <Stethoscope class="w-5 h-5 mr-2 text-gray-600" />
          Current Treatment Plan
        </h4>
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="space-y-2">
            <div v-if="patient.treatmentPlan.medications" class="space-y-1">
              <h5 class="font-medium text-blue-900">Medications</h5>
              <ul class="list-disc list-inside text-sm text-blue-800">
                <li v-for="med in patient.treatmentPlan.medications" :key="med">{{ med }}</li>
              </ul>
            </div>
            <div v-if="patient.treatmentPlan.instructions" class="space-y-1">
              <h5 class="font-medium text-blue-900">Instructions</h5>
              <p class="text-sm text-blue-800">{{ patient.treatmentPlan.instructions }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="space-y-3">
        <h4 class="text-lg font-medium text-gray-900 flex items-center">
          <Activity class="w-5 h-5 mr-2 text-gray-600" />
          Recent Activity
        </h4>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="space-y-3">
            <div class="flex items-start space-x-3 bg-white rounded-md p-3">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar class="w-4 h-4 text-green-600" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900">Last Visit</div>
                <div class="text-sm text-gray-500">{{ formatDate(patient.lastVisit) }}</div>
              </div>
            </div>
            <div v-if="patient.nextAppointment" class="flex items-start space-x-3 bg-white rounded-md p-3">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock class="w-4 h-4 text-blue-600" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900">Upcoming Appointment</div>
                <div class="text-sm text-gray-500">{{ formatDate(patient.nextAppointment) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button @click="patient && emit('edit', patient)" class="bg-blue-600 hover:bg-blue-700" :disabled="!patient">
        <Edit class="w-4 h-4 mr-2" />
        Edit Patient
      </Button>
      <Button @click="patient && emit('schedule', patient)" variant="outline" class="mr-3" :disabled="!patient">
        <Calendar class="w-4 h-4 mr-2" />
        Schedule Treatment
      </Button>
      <Button @click="emit('close')" variant="outline" class="mr-3">
        Cancel
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  User, FileText, Stethoscope, Activity, Calendar, Clock, Edit
} from 'lucide-vue-next'

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

defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [patient: Patient]
  schedule: [patient: Patient]
}>()

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

const getStatusBadgeClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800 border-green-200',
    recovering: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    stable: 'bg-blue-100 text-blue-800 border-blue-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800 border-gray-200'
}
</script>
