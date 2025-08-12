<template>
  <UserDashboardLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">My Assigned Patients</h2>
          <p class="text-gray-600">View and manage patients assigned to you by administration</p>
        </div>
        <!-- Info Badge - Staff cannot add patients manually -->
        <div class="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Assignment-Based Patient Management
        </div>
      </div>

      <!-- Quick Stats Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Users class="w-6 h-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalPatients }}</p>
                <p class="text-sm text-gray-600">Assigned Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <Activity class="w-6 h-6 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.activeAssignments }}</p>
                <p class="text-sm text-gray-600">Active Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                <Calendar class="w-6 h-6 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.upcomingTreatments }}</p>
                <p class="text-sm text-gray-600">Upcoming Treatments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <AlertTriangle class="w-6 h-6 text-red-600" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.highPriorityAssignments }}</p>
                <p class="text-sm text-gray-600">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Search and Filter Section -->
      <Card>
        <CardContent class="p-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search Input -->
            <div class="flex-1">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search patients by name, email, or condition..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Priority Filter -->
            <div class="sm:w-48">
              <select
                v-model="priorityFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div class="sm:w-48">
              <select
                v-model="statusFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">✅ Active</option>
                <option value="completed">✓ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>

            <!-- Department Filter -->
            <div class="sm:w-48">
              <select
                v-model="departmentFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                <option v-for="dept in departments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>
          </div>

          <!-- Results Summary -->
          <div class="mt-3 flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Showing {{ filteredAssignments.length }} of {{ assignments.length }} patient assignments
            </div>
            <div v-if="searchQuery || priorityFilter || statusFilter || departmentFilter" class="text-sm">
              <Button @click="clearFilters" variant="ghost" size="sm">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Loading your assigned patients...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Assignments</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <Button @click="fetchAssignments" class="bg-blue-600 hover:bg-blue-700">
          <RefreshCw class="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>

      <!-- Patient Assignments List -->
      <div v-else class="grid gap-4">
        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <Card>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment Details
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
                  <tr
                    v-for="assignment in filteredAssignments"
                    :key="assignment._id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {{ getPatientInitials(assignment.patientName) }}
                        </div>
                        <div class="ml-4">
                          <div class="font-medium text-gray-900">{{ assignment.patientName || 'Unknown Patient' }}</div>
                          <div class="text-sm text-gray-500">{{ assignment.patientEmail || 'No email' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900 font-medium">{{ assignment.department }}</div>
                      <div class="text-sm text-gray-500 max-w-xs truncate">
                        {{ assignment.notes || 'No notes available' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <Badge :class="getPriorityBadgeClass(assignment.priority)">
                        {{ getPriorityIcon(assignment.priority) }} {{ assignment.priority }}
                      </Badge>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <Badge :class="getStatusBadgeClass(assignment.status)">
                        {{ assignment.status }}
                      </Badge>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(assignment.startDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          @click="viewPatientDetails(assignment)"
                          class="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Eye class="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          @click="viewPatientDetails(assignment)"
                          class="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Stethoscope class="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          @click="scheduleAppointment(assignment)"
                          class="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <Calendar class="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <!-- Mobile Card View -->
        <div class="lg:hidden">
          <div class="space-y-4">
            <Card
              v-for="assignment in filteredAssignments"
              :key="assignment._id"
              class="hover:shadow-md transition-shadow"
            >
              <CardContent class="p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {{ getPatientInitials(assignment.patientName) }}
                    </div>
                    <div class="ml-3">
                      <h3 class="font-medium text-gray-900">{{ assignment.patientName || 'Unknown Patient' }}</h3>
                      <p class="text-sm text-gray-500">{{ assignment.patientEmail }}</p>
                      <p class="text-sm font-medium text-blue-600">{{ assignment.department }}</p>
                    </div>
                  </div>
                  <div class="flex flex-col space-y-1">
                    <Badge :class="getPriorityBadgeClass(assignment.priority)">
                      {{ getPriorityIcon(assignment.priority) }} {{ assignment.priority }}
                    </Badge>
                    <Badge :class="getStatusBadgeClass(assignment.status)">
                      {{ assignment.status }}
                    </Badge>
                  </div>
                </div>

                <div class="mb-4">
                  <p class="text-sm text-gray-600 mb-2">
                    {{ assignment.notes || 'No notes available' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    <Calendar class="w-3 h-3 inline mr-1" />
                    Started: {{ formatDate(assignment.startDate) }}
                  </p>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div class="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      @click="viewPatientDetails(assignment)"
                      class="text-blue-600 border-blue-300"
                    >
                      <Eye class="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      @click="viewPatientDetails(assignment)"
                      class="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Stethoscope class="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="scheduleAppointment(assignment)"
                    class="text-orange-600 border-orange-300"
                  >
                    <Calendar class="w-4 h-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && filteredAssignments.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Patient Assignments</h3>
          <p class="text-gray-600 mb-4 max-w-md mx-auto">
            {{ searchQuery || priorityFilter || statusFilter || departmentFilter
              ? 'No assignments match your current filters. Try adjusting your search criteria.'
              : 'You don\'t have any patient assignments yet. Contact your administrator if you believe this is an error.'
            }}
          </p>
          <div class="space-x-3">
            <Button
              @click="clearFilters"
              v-if="searchQuery || priorityFilter || statusFilter || departmentFilter"
              variant="outline"
            >
              Clear Filters
            </Button>
            <Button @click="fetchAssignments" class="bg-blue-600 hover:bg-blue-700">
              <RefreshCw class="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PatientDetailsModal
      :is-open="showPatientDetailsModal"
      :patient="selectedPatientData"
      @close="showPatientDetailsModal = false"
      @edit="openScheduleModal"
      @schedule="openScheduleModal"
    />

    <ScheduleTreatmentModal
      :is-open="showScheduleModal"
      :patient="selectedPatientData"
      :assignment="selectedAssignment"
      @close="showScheduleModal = false"
      @schedule="handleTreatmentSchedule"
    />
  </UserDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useAuthStore } from '@/stores/auth'
import UserDashboardLayout from '@/components/UserDashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import PatientDetailsModal from '@/components/modals/PatientDetailsModal.vue'
import ScheduleTreatmentModal from '@/components/modals/ScheduleTreatmentModal.vue'
import {
  Users, Activity, Calendar, Search, Eye, Stethoscope,
  AlertCircle, AlertTriangle, RefreshCw
} from 'lucide-vue-next'
import { patientAssignmentService } from '@/services/patientAssignmentService'
import type { Assignment } from '@/services/assignmentService'

// Types
interface PatientData {
  _id: string
  name: string
  email: string
  department: string
  status: 'active' | 'recovering' | 'stable' | 'critical'
  lastVisit: string // Required to match PatientDetailsModal interface
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

interface AssignmentStats {
  totalPatients: number
  activeAssignments: number
  upcomingTreatments: number
  highPriorityAssignments: number
}

// Reactive state
const toast = useToast()
const authStore = useAuthStore()
const isLoading = ref(false)
const error = ref<string | null>(null)
const assignments = ref<Assignment[]>([])
const stats = ref<AssignmentStats>({
  totalPatients: 0,
  activeAssignments: 0,
  upcomingTreatments: 0,
  highPriorityAssignments: 0
})

// Modal state
const showPatientDetailsModal = ref(false)
const showScheduleModal = ref(false)
const selectedAssignment = ref<Assignment | null>(null)
const selectedPatientData = ref<PatientData | null>(null)

// Filter state
const searchQuery = ref('')
const priorityFilter = ref('')
const statusFilter = ref('')
const departmentFilter = ref('')

// Computed properties
const departments = computed(() => {
  const deps = new Set<string>()
  assignments.value.forEach(a => {
    if (a.department) deps.add(a.department)
  })
  return Array.from(deps).sort()
})

const filteredAssignments = computed(() => {
  let filtered = assignments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(assignment =>
      assignment.patientName?.toLowerCase().includes(query) ||
      assignment.patientEmail?.toLowerCase().includes(query) ||
      assignment.department.toLowerCase().includes(query) ||
      assignment.notes?.toLowerCase().includes(query)
    )
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(assignment => assignment.priority === priorityFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(assignment => assignment.status === statusFilter.value)
  }

  if (departmentFilter.value) {
    filtered = filtered.filter(assignment => assignment.department === departmentFilter.value)
  }

  return filtered
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

const getPatientInitials = (name: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getPriorityIcon = (priority: string) => {
  const icons = {
    urgent: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  }
  return icons[priority as keyof typeof icons] || '⚪'
}

const getPriorityBadgeClass = (priority: string) => {
  const classes = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  }
  return classes[priority as keyof typeof classes] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const clearFilters = () => {
  searchQuery.value = ''
  priorityFilter.value = ''
  statusFilter.value = ''
  departmentFilter.value = ''
}

// API functions
const fetchAssignments = async () => {
  if (!authStore.user) return

  isLoading.value = true
  error.value = null

  try {
    const response = await patientAssignmentService.getAssignedPatients(authStore.user.id, {
      limit: 100,
      search: searchQuery.value || undefined
    })

    if (response.success) {
      assignments.value = response.data.assignments || []
      // Update stats based on assignments
      stats.value = {
        totalPatients: assignments.value.length,
        activeAssignments: assignments.value.filter(a => a.status === 'active').length,
        upcomingTreatments: 0, // Will be populated by treatment schedule API
        highPriorityAssignments: assignments.value.filter(a => a.priority === 'urgent' || a.priority === 'high').length
      }
    } else {
      throw new Error(response.message || 'Failed to fetch assignments')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load patient assignments'
    toast.error('Failed to load patient assignments')
  } finally {
    isLoading.value = false
  }
}

const fetchStats = async () => {
  if (!authStore.user) return

  try {
    const response = await patientAssignmentService.getAssignmentStats(authStore.user.id)
    if (response.success) {
      stats.value = { ...stats.value, ...response.data }
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

// Action handlers
const viewPatientDetails = async (assignment: Assignment) => {
  if (!assignment.patientId) {
    toast.error('Patient information not available')
    return
  }

  try {
    const patientData = await patientAssignmentService.getPatientDetails(assignment.patientId)
      selectedPatientData.value = {
        _id: patientData._id || assignment.patientId,
        name: patientData.name || assignment.patientName,
        email: patientData.email || assignment.patientEmail,
        department: patientData.department || assignment.department,
        status: (patientData.status as 'active' | 'recovering' | 'stable' | 'critical') || 'active',
        lastVisit: patientData.lastVisit || new Date().toISOString(),
        nextAppointment: patientData.nextAppointment,
        medicalHistory: patientData.medicalHistory?.map((item: any) => ({
          date: item.date || item.createdAt,
          condition: item.type || item.title,
          notes: item.content,
          description: item.content
        })),
        treatmentPlan: patientData.treatmentPlan
      }
    selectedAssignment.value = assignment
    showPatientDetailsModal.value = true
  } catch (error) {
    toast.error('Failed to load patient details')
  }
}

const scheduleAppointment = async (assignment: Assignment) => {
  selectedAssignment.value = assignment
  if (assignment.patientId) {
    try {
      const patientData = await patientAssignmentService.getPatientDetails(assignment.patientId)
      selectedPatientData.value = {
        _id: patientData._id || assignment.patientId,
        name: patientData.name || assignment.patientName,
        email: patientData.email || assignment.patientEmail,
        department: patientData.department || assignment.department,
        status: (patientData.status as 'active' | 'recovering' | 'stable' | 'critical') || 'active',
        lastVisit: patientData.lastVisit || new Date().toISOString(),
        nextAppointment: patientData.nextAppointment,
        medicalHistory: patientData.medicalHistory?.map((item: any) => ({
          date: item.date || item.createdAt,
          condition: item.type || item.title,
          notes: item.content,
          description: item.content
        })),
        treatmentPlan: patientData.treatmentPlan
      }
    } catch (error) {
      selectedPatientData.value = {
        _id: assignment.patientId,
        name: assignment.patientName,
        email: assignment.patientEmail,
        department: assignment.department,
        status: 'active',
        lastVisit: new Date().toISOString()
      }
    }
  }
  showScheduleModal.value = true
}

// Modal handlers
const handleTreatmentSchedule = async (scheduleData: any) => {
  try {
    if (selectedAssignment.value) {
      await patientAssignmentService.scheduleTreatment({
        ...scheduleData,
        patientId: selectedAssignment.value.patientId,
        assignmentId: selectedAssignment.value._id
      })
      await fetchStats() // Refresh stats
      showScheduleModal.value = false
      toast.success('Treatment scheduled successfully')
    }
  } catch (error) {
    toast.error('Failed to schedule treatment')
  }
}

const openScheduleModal = () => {
  if (selectedAssignment.value) {
    scheduleAppointment(selectedAssignment.value)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchAssignments(),
    fetchStats()
  ])
})
</script>

<style scoped>
/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Transition effects */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
