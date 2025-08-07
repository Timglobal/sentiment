<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white">
              <Stethoscope class="w-6 h-6" />
            </div>
            <div class="ml-4">
              <h2 class="text-xl font-semibold text-gray-900">Treatment Management</h2>
              <p class="text-sm text-gray-600">{{ patient?.name || 'Unknown Patient' }}</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <form @submit.prevent="saveTreatment" class="space-y-6">
          <!-- Patient Information Summary -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Patient Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Name:</span>
                <span class="ml-2 font-medium text-gray-900">{{ patient?.name }}</span>
              </div>
              <div>
                <span class="text-gray-500">Email:</span>
                <span class="ml-2 text-gray-900">{{ patient?.email }}</span>
              </div>
              <div>
                <span class="text-gray-500">Department:</span>
                <span class="ml-2 font-medium text-blue-600">{{ assignment?.department }}</span>
              </div>
            </div>
          </div>

          <!-- Medical Notes Section -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Medical Notes</h3>
              <Button
                type="button"
                @click="addNewNote"
                size="sm"
                variant="outline"
                class="text-green-600 border-green-300 hover:bg-green-50"
              >
                <Plus class="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>

            <!-- Existing Notes -->
            <div class="space-y-3 mb-4" v-if="existingNotes.length > 0">
              <div
                v-for="(note, index) in existingNotes"
                :key="`existing-${index}`"
                class="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <Badge :class="getNoteTypeBadgeClass(note.type)" class="mr-2">
                        {{ note.type }}
                      </Badge>
                      <span class="text-sm font-medium text-gray-900">{{ note.title }}</span>
                    </div>
                    <p class="text-sm text-gray-600">{{ note.content }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDate(note.createdAt) }} by {{ note.provider || 'Staff' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- New Notes -->
            <div class="space-y-4">
              <div
                v-for="(note, index) in treatmentForm.medicalNotes"
                :key="`note-${index}`"
                class="border border-blue-200 rounded-lg p-4 bg-blue-50"
              >
                <div class="flex justify-between items-start mb-3">
                  <h4 class="font-medium text-gray-900">New Medical Note</h4>
                  <button
                    type="button"
                    @click="removeNote(index)"
                    class="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                    <select
                      v-model="note.type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select type...</option>
                      <option value="examination">Examination</option>
                      <option value="diagnosis">Diagnosis</option>
                      <option value="treatment">Treatment</option>
                      <option value="medication">Medication</option>
                      <option value="observation">Observation</option>
                      <option value="procedure">Procedure</option>
                      <option value="consultation">Consultation</option>
                      <option value="lab_result">Lab Result</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      v-model="note.title"
                      type="text"
                      placeholder="Enter note title..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    v-model="note.content"
                    rows="3"
                    placeholder="Enter detailed note content..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Treatment Plan Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Treatment Plan</h3>

            <!-- Medications -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Medications</label>
              <div class="space-y-2">
                <div
                  v-for="(medication, index) in treatmentForm.treatmentPlan.medications"
                  :key="`med-${index}`"
                  class="flex items-center space-x-2"
                >
                  <input
                    v-model="treatmentForm.treatmentPlan.medications[index]"
                    type="text"
                    placeholder="Enter medication name and dosage..."
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    @click="removeMedication(index)"
                    class="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
                <Button
                  type="button"
                  @click="addMedication"
                  variant="outline"
                  size="sm"
                  class="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Plus class="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </div>
            </div>

            <!-- Instructions -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Treatment Instructions</label>
              <textarea
                v-model="treatmentForm.treatmentPlan.instructions"
                rows="4"
                placeholder="Enter detailed treatment instructions, care guidelines, and recommendations..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>

          <!-- Patient Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Patient Status</label>
            <select
              v-model="treatmentForm.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active Treatment</option>
              <option value="stable">Stable</option>
              <option value="improving">Improving</option>
              <option value="monitoring">Under Monitoring</option>
              <option value="discharged">Ready for Discharge</option>
            </select>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
        <Button @click="$emit('close')" variant="outline">
          Cancel
        </Button>
        <Button @click="saveTreatment" :disabled="isSaving" class="bg-green-600 hover:bg-green-700">
          <Save class="w-4 h-4 mr-2" />
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Treatment Plan</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  Stethoscope, X, Plus, Trash2, Save
} from 'lucide-vue-next'
import { patientAssignmentService } from '@/services/patientAssignmentService'

// Props
interface PatientData {
  _id: string
  name: string
  email: string
  department: string
  status?: string
  medicalHistory?: Array<{
    id: string
    date: string
    type: string
    title: string
    content: string
    provider: string
    createdAt: string
  }>
}

interface Assignment {
  _id: string
  patientId: string
  patientName: string
  patientEmail: string
  department: string
  priority: string
  status: string
  notes: string
  medicalNotes?: Array<{
    type: string
    title: string
    content: string
    createdAt: string
    provider: string
  }>
  treatmentPlan?: {
    medications: string[]
    instructions: string
  }
}

interface Props {
  isOpen: boolean
  patient: PatientData | null
  assignment: Assignment | null
}

// Emits
interface Emits {
  (e: 'close'): void
  (e: 'save', treatmentData: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive state
const toast = useToast()
const isSaving = ref(false)
const existingNotes = ref<any[]>([])

const treatmentForm = reactive({
  medicalNotes: [] as Array<{
    type: string
    title: string
    content: string
  }>,
  treatmentPlan: {
    medications: [] as string[],
    instructions: ''
  },
  status: 'active'
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

const getNoteTypeBadgeClass = (type: string) => {
  const classes = {
    examination: 'bg-blue-100 text-blue-800 border-blue-200',
    diagnosis: 'bg-red-100 text-red-800 border-red-200',
    treatment: 'bg-green-100 text-green-800 border-green-200',
    medication: 'bg-purple-100 text-purple-800 border-purple-200',
    observation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    procedure: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    consultation: 'bg-pink-100 text-pink-800 border-pink-200',
    lab_result: 'bg-teal-100 text-teal-800 border-teal-200'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// Form management
const addNewNote = () => {
  treatmentForm.medicalNotes.push({
    type: '',
    title: '',
    content: ''
  })
}

const removeNote = (index: number) => {
  treatmentForm.medicalNotes.splice(index, 1)
}

const addMedication = () => {
  treatmentForm.treatmentPlan.medications.push('')
}

const removeMedication = (index: number) => {
  treatmentForm.treatmentPlan.medications.splice(index, 1)
}

// Actions
const saveTreatment = async () => {
  if (!props.patient) return

  // Validate form
  for (const note of treatmentForm.medicalNotes) {
    if (!note.type || !note.title || !note.content) {
      toast.error('Please fill in all medical note fields')
      return
    }
  }

  isSaving.value = true
  try {
    const treatmentData = {
      medicalNotes: treatmentForm.medicalNotes.map(note => ({
        type: note.type,
        title: note.title,
        content: note.content
      })),
      treatmentPlan: {
        medications: treatmentForm.treatmentPlan.medications.filter(med => med.trim() !== ''),
        instructions: treatmentForm.treatmentPlan.instructions
      },
      status: treatmentForm.status
    }

    emit('save', treatmentData)
  } catch (error) {
    toast.error('Failed to save treatment plan')
  } finally {
    isSaving.value = false
  }
}

const loadExistingData = () => {
  // Load existing medical notes from patient's history or assignment
  if (props.patient?.medicalHistory) {
    existingNotes.value = props.patient.medicalHistory.map(note => ({
      type: note.type,
      title: note.title,
      content: note.content,
      provider: note.provider,
      createdAt: note.date
    }))
  } else if (props.assignment?.medicalNotes) {
    existingNotes.value = props.assignment.medicalNotes
  }

  // Load existing treatment plan
  if (props.assignment?.treatmentPlan) {
    treatmentForm.treatmentPlan.medications = [...(props.assignment.treatmentPlan.medications || [])]
    treatmentForm.treatmentPlan.instructions = props.assignment.treatmentPlan.instructions || ''
  }
}

// Initialize form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Reset form
    treatmentForm.medicalNotes = []
    treatmentForm.treatmentPlan.medications = ['']
    treatmentForm.treatmentPlan.instructions = ''
    treatmentForm.status = 'active'

    // Load existing data
    loadExistingData()
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadExistingData()
  }
})
</script>

<style scoped>
/* Custom scrollbar for content area */
.max-h-\[70vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[70vh\]::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.max-h-\[70vh\]::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.max-h-\[70vh\]::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animation for adding/removing items */
.space-y-2 > *,
.space-y-3 > *,
.space-y-4 > * {
  transition: all 0.2s ease-in-out;
}

/* Hover effects */
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:bg-blue-50:hover {
  background-color: #eff6ff;
}

.hover\:bg-green-50:hover {
  background-color: #f0fdf4;
}

/* Focus styles for form elements */
input:focus,
select:focus,
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}
</style>
