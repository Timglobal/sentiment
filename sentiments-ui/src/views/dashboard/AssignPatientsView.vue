<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Assign Patients to Workers</h2>
          <p class="text-gray-600">Manage patient-worker assignments for optimal care coordination</p>
        </div>
        <Button @click="openAssignModal" class="bg-blue-600 hover:bg-blue-700">
          <UserPlus class="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Total Assignments</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.totalAssignments }}</p>
              </div>
              <Users class="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Active Assignments</p>
                <p class="text-3xl font-bold text-green-600">{{ stats.activeAssignments }}</p>
              </div>
              <Activity class="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Available Patients</p>
                <p class="text-3xl font-bold text-purple-600">{{ stats.totalPatients }}</p>
              </div>
              <Heart class="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Available Workers</p>
                <p class="text-3xl font-bold text-orange-600">{{ stats.totalWorkers }}</p>
              </div>
              <UserCheck class="w-8 h-8 text-orange-600" />
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
                  placeholder="Search by patient name, worker name, or department..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Status Filter -->
            <div class="sm:w-48">
              <select
                v-model="statusFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <!-- Priority Filter -->
            <div class="sm:w-48">
              <select
                v-model="priorityFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <!-- Department Filter -->
            <div class="sm:w-48">
              <select
                v-model="departmentFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option v-for="dept in departments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>
          </div>

          <!-- Results Summary -->
          <div class="mt-3 text-sm text-gray-600">
            Showing {{ filteredAssignments.length }} of {{ assignments.length }} assignments
          </div>
        </CardContent>
      </Card>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Loading assignments...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Assignments</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <Button @click="fetchData" class="bg-blue-600 hover:bg-blue-700">
          Try Again
        </Button>
      </div>

      <!-- Assignments List -->
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
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <User class="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div class="font-medium text-gray-900">{{ assignment.patientName }}</div>
                          <div class="text-sm text-gray-500">{{ assignment.patientEmail }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <UserCheck class="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div class="font-medium text-gray-900">{{ assignment.workerName }}</div>
                          <div class="text-sm text-gray-500">{{ assignment.workerRole }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ assignment.department }}
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
                      <div class="flex space-x-2">
                        <Button
                          @click="editAssignment(assignment)"
                          variant="outline"
                          size="sm"
                          class="text-blue-600 hover:text-blue-700"
                        >
                          <Edit class="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          @click="toggleStatus(assignment)"
                          variant="outline"
                          size="sm"
                          class="text-yellow-600 hover:text-yellow-700"
                        >
                          {{ assignment.status === 'active' ? 'Cancel' : 'Activate' }}
                        </Button>
                        <Button
                          @click="deleteAssignment(assignment._id)"
                          variant="outline"
                          size="sm"
                          class="text-red-600 hover:text-red-700"
                        >
                          <Trash2 class="w-3 h-3" />
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
        <div class="lg:hidden grid gap-4">
          <Card v-if="filteredAssignments.length === 0">
            <CardContent class="p-6 text-center">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users class="w-8 h-8 text-gray-400" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p class="text-gray-600 mb-4">
                {{ searchQuery || statusFilter || priorityFilter || departmentFilter
                   ? 'Try adjusting your search or filters'
                   : 'Get started by creating your first assignment' }}
              </p>
              <Button
                v-if="!searchQuery && !statusFilter && !priorityFilter && !departmentFilter"
                @click="openAssignModal"
                class="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus class="w-4 h-4 mr-2" />
                Create First Assignment
              </Button>
            </CardContent>
          </Card>

          <Card v-else v-for="assignment in filteredAssignments" :key="assignment._id">
            <CardContent class="p-6">
              <div class="space-y-4">
                <!-- Patient and Worker Info -->
                <div class="flex justify-between items-start">
                  <div class="space-y-2">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User class="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-900">{{ assignment.patientName }}</h3>
                        <p class="text-sm text-gray-500">{{ assignment.patientEmail }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3 pl-13">
                      <ArrowRight class="w-4 h-4 text-gray-400" />
                      <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck class="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{{ assignment.workerName }}</p>
                          <p class="text-xs text-gray-500">{{ assignment.workerRole }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col items-end space-y-2">
                    <Badge :class="getPriorityBadgeClass(assignment.priority)">
                      {{ getPriorityIcon(assignment.priority) }} {{ assignment.priority }}
                    </Badge>
                    <Badge :class="getStatusBadgeClass(assignment.status)">
                      {{ assignment.status }}
                    </Badge>
                  </div>
                </div>

                <!-- Assignment Details -->
                <div class="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Department:</span>
                    <span class="font-medium">{{ assignment.department }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Start Date:</span>
                    <span class="font-medium">{{ formatDate(assignment.startDate) }}</span>
                  </div>
                  <div v-if="assignment.endDate" class="flex justify-between text-sm">
                    <span class="text-gray-600">End Date:</span>
                    <span class="font-medium">{{ formatDate(assignment.endDate) }}</span>
                  </div>
                  <div v-if="assignment.notes" class="text-sm">
                    <span class="text-gray-600">Notes:</span>
                    <p class="mt-1 text-gray-900">{{ assignment.notes }}</p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-2">
                  <Button
                    @click="editAssignment(assignment)"
                    variant="outline"
                    size="sm"
                    class="flex-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit class="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    @click="toggleStatus(assignment)"
                    variant="outline"
                    size="sm"
                    class="flex-1 text-yellow-600 hover:text-yellow-700"
                  >
                    {{ assignment.status === 'active' ? 'Cancel' : 'Activate' }}
                  </Button>
                  <Button
                    @click="deleteAssignment(assignment._id)"
                    variant="outline"
                    size="sm"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Assignment Modal -->
      <AssignmentModal
        :is-open="showAssignModal"
        :assignment="editingAssignment"
        @close="closeAssignModal"
        @submit="handleAssignment"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import DashboardLayout from '@/components/DashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import AssignmentModal from '@/components/AssignmentModal.vue'
import {
  Users, Activity, Heart, UserCheck, UserPlus, Search,
  AlertCircle, User, Edit, Trash2, ArrowRight
} from 'lucide-vue-next'
import { workerService } from '@/services/workerService'
import { assignmentService } from '@/services/assignmentService'

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
  status: 'active' | 'completed' | 'cancelled'
  notes: string
  startDate: string
  endDate?: string
  createdAt: string
}

// Reactive state
const toast = useToast()
const isLoading = ref(false)
const error = ref<string | null>(null)
const patients = ref<Patient[]>([])
const workers = ref<Worker[]>([])
const assignments = ref<Assignment[]>([])
const showAssignModal = ref(false)
const editingAssignment = ref<Assignment | null>(null)
const assignmentStats = ref({
  totalAssignments: 0,
  activeAssignments: 0,
  completedAssignments: 0,
  totalPatients: 0,
  totalWorkers: 0
})

// Filter state
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const departmentFilter = ref('')

// Computed
const stats = computed(() => ({
  totalAssignments: assignmentStats.value.totalAssignments || assignments.value.length,
  activeAssignments: assignmentStats.value.activeAssignments || assignments.value.filter(a => a.status === 'active').length,
  totalPatients: assignmentStats.value.totalPatients || patients.value.length,
  totalWorkers: assignmentStats.value.totalWorkers || workers.value.length
}))

const departments = computed(() => {
  const deps = new Set<string>()
  patients.value.forEach(p => deps.add(p.department))
  workers.value.forEach(w => w.department && deps.add(w.department))
  return Array.from(deps).sort()
})

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

  if (departmentFilter.value) {
    filtered = filtered.filter(a => a.department === departmentFilter.value)
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

const getPriorityIcon = (priority: string) => {
  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
  }
  return icons[priority as keyof typeof icons] || '⚪'
}

const getPriorityBadgeClass = (priority: string) => {
  const classes = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  }
  return classes[priority as keyof typeof classes] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// API functions
const fetchUsers = async () => {
  try {
    const users = await workerService.getWorkers()

    // Separate patients and workers
    patients.value = users
      .filter(user => user.role === 'patient' && user.department)
      .map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department!,
        role: user.role
      }))
    workers.value = users
      .filter(user => (user.role === 'staff') && user.department)
      .map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department!
      }))
  } catch (err: any) {
    console.error('Error fetching users:', err)
    if (err.message?.includes('No token provided') || err.message?.includes('Invalid token')) {
      error.value = 'Authentication required. Please log in to access the dashboard.'
    } else {
      error.value = 'Failed to load users: ' + (err.message || 'Unknown error')
    }
  }
}

const fetchAssignments = async () => {
  try {
    const response = await assignmentService.getAssignments()

    // Transform the response data to match our interface
    assignments.value = response.map((assignment: any) => ({
      _id: assignment._id,
      patientId: assignment.patientId,
      patientName: assignment.patient?.name || 'Unknown Patient',
      patientEmail: assignment.patient?.email || '',
      workerId: assignment.workerId,
      workerName: assignment.worker?.name || 'Unknown Worker',
      workerRole: assignment.worker?.role || 'Staff',
      department: assignment.department,
      priority: assignment.priority,
      status: assignment.status,
      notes: assignment.notes || '',
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      createdAt: assignment.createdAt
    }))
  } catch (err: any) {
    console.error('Error fetching assignments:', err)
    if (err.message?.includes('No token provided') || err.message?.includes('Invalid token')) {
      error.value = 'Authentication required. Please log in to view assignments.'
    } else {
      error.value = 'Failed to load assignments: ' + (err.message || 'Unknown error')
    }

    // Fallback to empty array
    assignments.value = []
  }
}

const fetchAssignmentStats = async () => {
  try {
    const stats = await assignmentService.getAssignmentStats()
    if (stats?.overview) {
      assignmentStats.value = {
        totalAssignments: stats.overview.totalAssignments || 0,
        activeAssignments: stats.overview.activeAssignments || 0,
        completedAssignments: stats.overview.completedAssignments || 0,
        totalPatients: stats.totalPatients || 0,
        totalWorkers: stats.totalWorkers || 0
      }
    }
  } catch (err: any) {
    console.error('Error fetching assignment stats:', err)
    // Don't set error here as this is non-critical, but show a console warning
    if (err.message?.includes('token')) {
      console.warn('Authentication required for assignment stats')
    }
  }
}

const fetchData = async () => {
  isLoading.value = true
  error.value = null

  try {
    await Promise.all([
      fetchUsers(),
      fetchAssignments(),
      fetchAssignmentStats()
    ])
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
  }
}

// Modal functions
const openAssignModal = () => {
  editingAssignment.value = null
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  editingAssignment.value = null
}

const editAssignment = (assignment: Assignment) => {
  editingAssignment.value = assignment
  showAssignModal.value = true
}

const handleAssignment = async (assignmentData: any) => {
  try {
    if (editingAssignment.value) {
      // Update existing assignment
      const updatedAssignment = await assignmentService.updateAssignment(
        editingAssignment.value._id,
        {
          priority: assignmentData.priority,
          notes: assignmentData.notes,
          endDate: assignmentData.endDate
        }
      )

      // Update local state
      const index = assignments.value.findIndex(a => a._id === editingAssignment.value!._id)
      if (index !== -1) {
        assignments.value[index] = {
          ...assignments.value[index],
          priority: updatedAssignment.priority,
          notes: updatedAssignment.notes || '',
          endDate: updatedAssignment.endDate
        }
      }

      toast.success('Assignment updated successfully! ✅')
    } else {
      // Create new assignment
      const newAssignment = await assignmentService.createAssignment({
        patientId: assignmentData.patientId,
        patientName: assignmentData.patientName,
        patientEmail: assignmentData.patientEmail,
        workerId: assignmentData.workerId,
        workerName: assignmentData.workerName,
        workerRole: assignmentData.workerRole,
        department: assignmentData.department,
        priority: assignmentData.priority || 'medium',
        notes: assignmentData.notes,
        startDate: assignmentData.startDate || new Date().toISOString(),
        endDate: assignmentData.endDate
      })

      // Add to local state
      const assignmentForView: Assignment = {
        _id: newAssignment._id,
        patientId: newAssignment.patientId,
        patientName: newAssignment.patientName,
        patientEmail: newAssignment.patientEmail,
        workerId: newAssignment.workerId,
        workerName: newAssignment.workerName,
        workerRole: newAssignment.workerRole,
        department: newAssignment.department,
        priority: newAssignment.priority,
        status: newAssignment.status,
        notes: newAssignment.notes || '',
        startDate: newAssignment.startDate,
        endDate: newAssignment.endDate,
        createdAt: newAssignment.createdAt
      }

      assignments.value.unshift(assignmentForView)

      // Refresh stats
      await fetchAssignmentStats()

      toast.success('Assignment created successfully! ✅')
    }

    closeAssignModal()
  } catch (err: any) {
    console.error('Error handling assignment:', err)
    const errorMessage = err.message || 'Failed to save assignment'
    toast.error(errorMessage)
  }
}

const toggleStatus = async (assignment: Assignment) => {
  try {
    const newStatus = assignment.status === 'active' ? 'cancelled' : 'active'

    await assignmentService.updateAssignment(assignment._id, {
      status: newStatus
    })

    // Update local state
    assignment.status = newStatus

    // Refresh stats
    await fetchAssignmentStats()

    toast.success(`Assignment ${newStatus === 'active' ? 'activated' : 'cancelled'} ✅`)
  } catch (err: any) {
    console.error('Error updating assignment status:', err)
    const errorMessage = err.message || 'Failed to update assignment status'
    toast.error(errorMessage)
  }
}

const deleteAssignment = async (assignmentId: string) => {
  if (!confirm('Are you sure you want to delete this assignment?')) return

  try {
    await assignmentService.deleteAssignment(assignmentId)

    // Remove from local state
    assignments.value = assignments.value.filter(a => a._id !== assignmentId)

    // Refresh stats
    await fetchAssignmentStats()

    toast.success('Assignment deleted successfully! ✅')
  } catch (err: any) {
    console.error('Error deleting assignment:', err)
    const errorMessage = err.message || 'Failed to delete assignment'
    toast.error(errorMessage)
  }
}

// Lifecycle
onMounted(() => {
  fetchData()
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
</style>
