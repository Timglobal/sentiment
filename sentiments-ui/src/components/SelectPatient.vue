<template>
  <div>
    <!-- Dialog Trigger -->
    <Button
      variant="outline"
      class="w-full justify-start bg-transparent"
      @click="isOpen = true"
    >
      <User class="w-4 h-4 mr-2" />
      {{ selectedPatient ? selectedPatient.name : placeholder }}
    </Button>

    <!-- Dialog Modal -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click="handleClose"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/50" />

      <!-- Dialog Content -->
      <div
        class="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">{{ triggerLabel }}</h2>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search patients..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="max-h-64 overflow-y-auto">
            <div v-if="isLoading" class="text-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p class="text-sm text-gray-500 mt-2">Loading patients...</p>
            </div>

            <div v-else-if="filteredPatients.length === 0" class="text-center py-4">
              <p class="text-sm text-gray-500">No patients found</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="patient in filteredPatients"
                :key="patient._id"
                class="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                @click="handlePatientSelect(patient)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ patient.name }}</p>
                    <p class="text-sm text-gray-500">{{ patient.email }}</p>
                    <p class="text-xs text-gray-400">{{ patient.department }}</p>
                  </div>
                  <div class="flex items-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Patient
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <Button variant="outline" @click="handleClose">
            Cancel
          </Button>
        </div>
      </div>
    </div>

    <!-- Selected Patient Badge -->
    <div v-if="selectedPatient" class="mt-2">
      <Badge variant="secondary" class="flex items-center gap-1 w-fit">
        <User class="w-3 h-3" />
        {{ selectedPatient.name }} - {{ selectedPatient.department }}
        <button
          @click="handleClearSelection"
          class="ml-1 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from './ui/Button.vue'
import Badge from './ui/Badge.vue'
import { User, X } from 'lucide-vue-next'
import { workerService } from '@/services/workerService'

// Patient interface based on the current usage
interface Patient {
  _id: string
  name: string
  email: string
  department: string
  role: string
}

interface Props {
  selectedPatient: Patient | null
  triggerLabel?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  triggerLabel: 'Select Patient',
  placeholder: 'Search and select a patient'
})

const emit = defineEmits<{
  'patient-select': [patient: Patient | null]
}>()

// State
const patients = ref<Patient[]>([])
const isLoading = ref(false)
const isOpen = ref(false)
const searchQuery = ref('')

const handlePatientSelect = (patient: Patient) => {
  emit('patient-select', patient)
  isOpen.value = false
  searchQuery.value = ''
}

const handleClose = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const handleClearSelection = () => {
  emit('patient-select', null)
}

// Filter patients based on search query
const filteredPatients = computed(() => {
  let filtered = patients.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.department.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Fetch patients from the worker service (filtering by patient role)
const fetchPatients = async () => {
  isLoading.value = true
  try {
    const users = await workerService.getWorkers()

    // Filter for patients with departments
    patients.value = users
      .filter(user => user.role === 'patient' && user.department)
      .map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department!,
        role: user.role
      }))
  } catch (error) {
    console.error('Failed to fetch patients:', error)
  } finally {
    isLoading.value = false
  }
}

// Fetch patients when component mounts
onMounted(() => {
  fetchPatients()
})
</script>
