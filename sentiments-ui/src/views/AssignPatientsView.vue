<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        👥 Assign Patients to Workers
      </h1>
      <p class="text-gray-600 text-sm sm:text-base">
        Manage patient-worker assignments for optimal care coordination
      </p>
    </div>

    <!-- Assignment Form -->
    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        📝 Create New Assignment
      </h2>

      <form @submit.prevent="handleAssignment" class="space-y-4">
        <!-- Mobile-first grid layout -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Patient Selection -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Select Patient
            </label>
            <select
              v-model="assignmentForm.patientId"
              :style="selectStyle"
              required
              class="w-full"
            >
              <option value="">Choose a patient...</option>
              <option
                v-for="patient in patients"
                :key="patient._id"
                :value="patient._id"
              >
                {{ patient.name }} - {{ patient.department }}
              </option>
            </select>
          </div>

          <!-- Worker Selection -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Select Worker
            </label>
            <select
              v-model="assignmentForm.workerId"
              :style="selectStyle"
              required
              class="w-full"
            >
              <option value="">Choose a worker...</option>
              <option
                v-for="worker in workers"
                :key="worker._id"
                :value="worker._id"
              >
                {{ worker.name }} - {{ worker.role }}
              </option>
            </select>
          </div>

          <!-- Priority Level -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Priority Level
            </label>
            <select
              v-model="assignmentForm.priority"
              :style="selectStyle"
              class="w-full"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>
        </div>

        <!-- Assignment Notes -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Assignment Notes
          </label>
          <textarea
            v-model="assignmentForm.notes"
            :style="textareaStyle"
            placeholder="Add any special instructions or notes..."
            rows="3"
            class="w-full"
          ></textarea>
        </div>

        <!-- Assignment Duration -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="datetime-local"
              v-model="assignmentForm.startDate"
              :style="inputStyle"
              required
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              End Date (Optional)
            </label>
            <input
              type="datetime-local"
              v-model="assignmentForm.endDate"
              :style="inputStyle"
              class="w-full"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <button
            type="submit"
            :style="buttonStyle"
            :disabled="isSubmitting"
            class="w-full sm:w-auto"
          >
            {{ isSubmitting ? 'Creating Assignment...' : '✨ Create Assignment' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
        <div class="text-2xl font-bold">{{ stats.totalAssignments }}</div>
        <div class="text-sm opacity-90">Total Assignments</div>
      </div>
      <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
        <div class="text-2xl font-bold">{{ stats.activeAssignments }}</div>
        <div class="text-sm opacity-90">Active Assignments</div>
      </div>
      <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
        <div class="text-2xl font-bold">{{ stats.totalPatients }}</div>
        <div class="text-sm opacity-90">Total Patients</div>
      </div>
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
        <div class="text-2xl font-bold">{{ stats.totalWorkers }}</div>
        <div class="text-sm opacity-90">Available Workers</div>
      </div>
    </div>

    <!-- Filter and Search -->
    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">
          📋 Current Assignments
        </h2>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search assignments..."
            :style="inputStyle"
            class="w-full sm:w-64"
          />
          <select v-model="statusFilter" :style="selectStyle" class="w-full sm:w-auto">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="suspended">Suspended</option>
          </select>
          <select v-model="priorityFilter" :style="selectStyle" class="w-full sm:w-auto">
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Assignments Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Mobile Card View -->
      <div class="block sm:hidden">
        <div v-if="filteredAssignments.length === 0" class="p-6 text-center text-gray-500">
          No assignments found
        </div>
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="assignment in filteredAssignments"
            :key="assignment._id"
            class="p-4 space-y-3"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-gray-900">{{ assignment.patientName }}</h3>
                <p class="text-sm text-gray-600">{{ assignment.workerName }}</p>
              </div>
              <span :class="getPriorityBadgeClass(assignment.priority)" class="px-2 py-1 text-xs rounded-full">
                {{ assignment.priority }}
              </span>
            </div>
            <div class="text-sm text-gray-600">
              <p><strong>Department:</strong> {{ assignment.department }}</p>
              <p><strong>Started:</strong> {{ formatDate(assignment.startDate) }}</p>
              <p v-if="assignment.endDate"><strong>Ends:</strong> {{ formatDate(assignment.endDate) }}</p>
            </div>
            <div class="flex flex-wrap gap-2 pt-2">
              <button
                @click="editAssignment(assignment)"
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                @click="toggleStatus(assignment)"
                class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
              >
                {{ assignment.status === 'active' ? 'Suspend' : 'Activate' }}
              </button>
              <button
                @click="deleteAssignment(assignment._id)"
                class="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Worker
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredAssignments.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                No assignments found
              </td>
            </tr>
            <tr v-else v-for="assignment in filteredAssignments" :key="assignment._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ assignment.patientName }}</div>
                <div class="text-sm text-gray-500">{{ assignment.patientEmail }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ assignment.workerName }}</div>
                <div class="text-sm text-gray-500">{{ assignment.workerRole }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ assignment.department }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getPriorityBadgeClass(assignment.priority)" class="px-2 py-1 text-xs rounded-full">
                  {{ assignment.priority }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(assignment.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ assignment.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(assignment.startDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="editAssignment(assignment)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  @click="toggleStatus(assignment)"
                  class="text-yellow-600 hover:text-yellow-900"
                >
                  {{ assignment.status === 'active' ? 'Suspend' : 'Activate' }}
                </button>
                <button
                  @click="deleteAssignment(assignment._id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import { API_BASE_URL } from '@/config'

// Types
interface Patient {
  _id: string
  name: string
  email: string
  department: string
  role: string
}

interface Worker {
  _id: string
  name: string
  email: string
  role: string
  department: string
}

interface Assignment {
  _id: string
  patientId: string
  patientName: string
  patientEmail: string
  workerId: string
  workerName: string
  workerRole: string
  department: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'completed' | 'suspended'
  notes: string
  startDate: string
  endDate?: string
  createdAt: string
}

// Reactive state
const toast = useToast()
const isLoading = ref(false)
const isSubmitting = ref(false)
const patients = ref<Patient[]>([])
const workers = ref<Worker[]>([])
const assignments = ref<Assignment[]>([])

// Form state
const assignmentForm = ref({
  patientId: '',
  workerId: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  notes: '',
  startDate: new Date().toISOString().slice(0, 16),
  endDate: ''
})

// Filter state
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

// Computed
const stats = computed(() => ({
  totalAssignments: assignments.value.length,
  activeAssignments: assignments.value.filter(a => a.status === 'active').length,
  totalPatients: patients.value.length,
  totalWorkers: workers.value.length
}))

const filteredAssignments = computed(() => {
  let filtered = assignments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.patientName.toLowerCase().includes(query) ||
      a.workerName.toLowerCase().includes(query) ||
      a.department.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(a => a.status === statusFilter.value)
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(a => a.priority === priorityFilter.value)
  }

  return filtered
})

// Styles
const inputStyle = `
  width: 100%;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: white;
  color: #111827;
  outline: none;
  transition: border-color 0.2s ease;
`

const selectStyle = inputStyle

const textareaStyle = inputStyle

const buttonStyle = `
  background-color: #10B981;
  color: white;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
`

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityBadgeClass = (priority: string) => {
  const classes = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return classes[priority as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    suspended: 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

// API functions
const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/workers`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) throw new Error('Failed to fetch users')

    const users = await response.json()

    // Separate patients and workers
    patients.value = users.filter((user: any) => user.role === 'patient')
    workers.value = users.filter((user: any) => user.role === 'staff' || user.role === 'admin')
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.error('Failed to load users')
  }
}

const fetchAssignments = async () => {
  try {
    // Mock assignments for now - replace with actual API call
    assignments.value = [
      {
        _id: '1',
        patientId: 'p1',
        patientName: 'John Doe',
        patientEmail: 'john.doe@example.com',
        workerId: 'w1',
        workerName: 'Dr. Smith',
        workerRole: 'Doctor',
        department: 'Cardiology',
        priority: 'high',
        status: 'active',
        notes: 'Requires immediate attention for heart condition',
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        patientId: 'p2',
        patientName: 'Jane Smith',
        patientEmail: 'jane.smith@example.com',
        workerId: 'w2',
        workerName: 'Nurse Johnson',
        workerRole: 'Nurse',
        department: 'Emergency',
        priority: 'urgent',
        status: 'active',
        notes: 'Emergency case - monitor vital signs',
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ] as Assignment[]
  } catch (error) {
    console.error('Error fetching assignments:', error)
    toast.error('Failed to load assignments')
  }
}

const handleAssignment = async () => {
  try {
    isSubmitting.value = true

    // Find patient and worker details
    const patient = patients.value.find(p => p._id === assignmentForm.value.patientId)
    const worker = workers.value.find(w => w._id === assignmentForm.value.workerId)

    if (!patient || !worker) {
      throw new Error('Please select both patient and worker')
    }

    // Mock assignment creation - replace with actual API call
    const newAssignment: Assignment = {
      _id: Date.now().toString(),
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      workerId: worker._id,
      workerName: worker.name,
      workerRole: worker.role,
      department: patient.department,
      priority: assignmentForm.value.priority,
      status: 'active',
      notes: assignmentForm.value.notes,
      startDate: assignmentForm.value.startDate,
      endDate: assignmentForm.value.endDate || undefined,
      createdAt: new Date().toISOString()
    }

    assignments.value.unshift(newAssignment)

    // Reset form
    assignmentForm.value = {
      patientId: '',
      workerId: '',
      priority: 'medium',
      notes: '',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: ''
    }

    toast.success('Assignment created successfully! ✅')
  } catch (error) {
    console.error('Error creating assignment:', error)
    toast.error('Failed to create assignment')
  } finally {
    isSubmitting.value = false
  }
}

const editAssignment = (assignment: Assignment) => {
  // Fill form with assignment data for editing
  assignmentForm.value = {
    patientId: assignment.patientId,
    workerId: assignment.workerId,
    priority: assignment.priority,
    notes: assignment.notes,
    startDate: assignment.startDate.slice(0, 16),
    endDate: assignment.endDate ? assignment.endDate.slice(0, 16) : ''
  }

  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleStatus = async (assignment: Assignment) => {
  try {
    const newStatus = assignment.status === 'active' ? 'suspended' : 'active'
    assignment.status = newStatus
    toast.success(`Assignment ${newStatus === 'active' ? 'activated' : 'suspended'} ✅`)
  } catch (error) {
    console.error('Error updating assignment status:', error)
    toast.error('Failed to update assignment status')
  }
}

const deleteAssignment = async (assignmentId: string) => {
  if (!confirm('Are you sure you want to delete this assignment?')) return

  try {
    assignments.value = assignments.value.filter(a => a._id !== assignmentId)
    toast.success('Assignment deleted successfully! ✅')
  } catch (error) {
    console.error('Error deleting assignment:', error)
    toast.error('Failed to delete assignment')
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      fetchUsers(),
      fetchAssignments()
    ])
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Custom responsive styles */
@media (max-width: 640px) {
  .max-w-6xl {
    max-width: 100%;
  }
}

/* Focus states for better accessibility */
input:focus, select:focus, textarea:focus {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
