<template>
  <UserDashboardLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Task Management</h2>
          <p class="text-gray-600">Create, track, and manage your time-based tasks and activities</p>
        </div>
        <div class="flex items-center space-x-3">
          <Badge class="bg-blue-100 text-blue-800">Staff Member</Badge>
          <Button @click="showCreateTaskModal = true" class="bg-blue-600 hover:bg-blue-700">
            <Plus class="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <!-- Quick Stats Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <ListTodo class="w-6 h-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalTasks }}</p>
                <p class="text-sm text-gray-600">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <Clock class="w-6 h-6 text-orange-600" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.pendingTasks }}</p>
                <p class="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <CheckCircle class="w-6 h-6 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ stats.completedTasks }}</p>
                <p class="text-sm text-gray-600">Completed</p>
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
                <p class="text-2xl font-bold text-gray-900">{{ stats.overdueTasks }}</p>
                <p class="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Filters and Search -->
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
                  placeholder="Search tasks by title, description, or category..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Status Filter -->
            <div class="sm:w-48">
              <select
                v-model="statusFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">🟡 Pending</option>
                <option value="in-progress">🔵 In Progress</option>
                <option value="completed">✅ Completed</option>
                <option value="overdue">🔴 Overdue</option>
              </select>
            </div>

            <!-- Priority Filter -->
            <div class="sm:w-48">
              <select
                v-model="priorityFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>

            <!-- Category Filter -->
            <div class="sm:w-48">
              <select
                v-model="categoryFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <!-- Results Summary -->
          <div class="mt-3 flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Showing {{ filteredTasks.length }} of {{ tasks.length }} tasks
            </div>
            <div v-if="searchQuery || statusFilter || priorityFilter || categoryFilter" class="text-sm">
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
          <p class="text-gray-600">Loading your tasks...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Tasks</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <Button @click="fetchTasks" class="bg-blue-600 hover:bg-blue-700">
          <RefreshCw class="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>

      <!-- Tasks List -->
      <div v-else class="space-y-4">
        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <Card>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="task in filteredTasks"
                    :key="task._id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <div>
                        <div class="font-medium text-gray-900 mb-1">{{ task.title }}</div>
                        <div class="text-sm text-gray-500 max-w-xs truncate">{{ task.description }}</div>
                        <div class="text-xs text-gray-400 mt-1">
                          Created: {{ formatDate(task.createdAt) }}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <Badge :class="getPriorityBadgeClass(task.priority)">
                        {{ getPriorityIcon(task.priority) }} {{ task.priority }}
                      </Badge>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <Badge :class="getStatusBadgeClass(task.status)">
                        {{ getStatusIcon(task.status) }} {{ task.status }}
                      </Badge>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ formatDate(task.dueDate) }}
                      </div>
                      <div class="text-xs" :class="isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'">
                        {{ getTimeRemaining(task.dueDate) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ task.category }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          @click="viewTask(task)"
                          class="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Eye class="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          @click="editTask(task)"
                          class="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Edit class="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          @click="toggleTaskStatus(task)"
                          :class="task.status === 'completed'
                            ? 'text-orange-600 border-orange-300 hover:bg-orange-50'
                            : 'text-green-600 border-green-300 hover:bg-green-50'"
                        >
                          <CheckCircle v-if="task.status !== 'completed'" class="w-4 h-4" />
                          <RotateCcw v-else class="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          @click="deleteTask(task._id)"
                          class="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 class="w-4 h-4" />
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
        <div class="lg:hidden space-y-4">
          <Card
            v-for="task in filteredTasks"
            :key="task._id"
            class="hover:shadow-md transition-shadow"
          >
            <CardContent class="p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 mb-1">{{ task.title }}</h3>
                  <p class="text-sm text-gray-600 mb-2">{{ task.description }}</p>
                  <p class="text-xs text-gray-500">{{ task.category }}</p>
                </div>
                <div class="flex flex-col space-y-2 ml-4">
                  <Badge :class="getPriorityBadgeClass(task.priority)">
                    {{ getPriorityIcon(task.priority) }} {{ task.priority }}
                  </Badge>
                  <Badge :class="getStatusBadgeClass(task.status)">
                    {{ getStatusIcon(task.status) }} {{ task.status }}
                  </Badge>
                </div>
              </div>

              <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div class="flex items-center">
                  <Calendar class="w-4 h-4 mr-1" />
                  {{ formatDate(task.dueDate) }}
                </div>
                <div :class="isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'">
                  {{ getTimeRemaining(task.dueDate) }}
                </div>
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                <div class="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="viewTask(task)"
                    class="text-blue-600 border-blue-300"
                  >
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="editTask(task)"
                    class="text-green-600 border-green-300"
                  >
                    <Edit class="w-4 h-4" />
                  </Button>
                </div>
                <div class="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="toggleTaskStatus(task)"
                    :class="task.status === 'completed'
                      ? 'text-orange-600 border-orange-300'
                      : 'text-green-600 border-green-300'"
                  >
                    <CheckCircle v-if="task.status !== 'completed'" class="w-4 h-4" />
                    <RotateCcw v-else class="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="deleteTask(task._id)"
                    class="text-red-600 border-red-300"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && filteredTasks.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ListTodo class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
          <p class="text-gray-600 mb-4 max-w-md mx-auto">
            {{ searchQuery || statusFilter || priorityFilter || categoryFilter
              ? 'No tasks match your current filters. Try adjusting your search criteria.'
              : 'You haven\'t created any tasks yet. Create your first task to get started.'
            }}
          </p>
          <div class="space-x-3">
            <Button
              @click="clearFilters"
              v-if="searchQuery || statusFilter || priorityFilter || categoryFilter"
              variant="outline"
            >
              Clear Filters
            </Button>
            <Button @click="showCreateTaskModal = true" class="bg-blue-600 hover:bg-blue-700">
              <Plus class="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Task Modal -->
    <CreateTaskModal
      :is-open="showCreateTaskModal || showEditTaskModal"
      :task="selectedTask"
      :is-editing="showEditTaskModal"
      @close="closeModals"
      @save="handleTaskSave"
    />

    <!-- View Task Modal -->
    <ViewTaskModal
      :is-open="showViewTaskModal"
      :task="selectedTask"
      @close="showViewTaskModal = false"
      @edit="editTask"
      @delete="deleteTask"
      @toggle-status="toggleTaskStatus"
    />
  </UserDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useAuthStore } from '@/stores/auth'
import taskService from '@/services/taskService'
import type { CreateTaskRequest } from '@/services/taskService'
import UserDashboardLayout from '@/components/UserDashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import CreateTaskModal from '@/components/modals/CreateTaskModal.vue'
import ViewTaskModal from '@/components/modals/ViewTaskModal.vue'
import {
  ListTodo, Plus, Clock, CheckCircle, AlertTriangle, Search, Eye, Edit,
  Trash2, RotateCcw, Calendar, RefreshCw, AlertCircle
} from 'lucide-vue-next'

// Types
interface Task {
  _id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  category: string
  dueDate: string
  createdAt: string
  updatedAt: string
  userId: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
}

interface TaskStats {
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  overdueTasks: number
}

// Reactive state
const toast = useToast()
const authStore = useAuthStore()
const isLoading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<Task[]>([])
const stats = ref<TaskStats>({
  totalTasks: 0,
  pendingTasks: 0,
  completedTasks: 0,
  overdueTasks: 0
})

// Modal state
const showCreateTaskModal = ref(false)
const showEditTaskModal = ref(false)
const showViewTaskModal = ref(false)
const selectedTask = ref<Task | null>(null)

// Filter state
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const categoryFilter = ref('')

// Computed properties
const categories = computed(() => {
  const cats = new Set<string>()
  tasks.value.forEach(task => {
    if (task.category) cats.add(task.category)
  })
  return Array.from(cats).sort()
})

const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(task => task.priority === priorityFilter.value)
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(task => task.category === categoryFilter.value)
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

const isOverdue = (dueDateString: string) => {
  return new Date(dueDateString) < new Date() && !tasks.value.find(t => t.dueDate === dueDateString && t.status === 'completed')
}

const getTimeRemaining = (dueDateString: string) => {
  const dueDate = new Date(dueDateString)
  const now = new Date()
  const diffMs = dueDate.getTime() - now.getTime()

  if (diffMs < 0) {
    const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24))
    return `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} left`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} left`
  } else {
    return 'Due soon'
  }
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

const getStatusIcon = (status: string) => {
  const icons = {
    pending: '🟡',
    'in-progress': '🔵',
    completed: '✅',
    overdue: '🔴'
  }
  return icons[status as keyof typeof icons] || '⚪'
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
  categoryFilter.value = ''
}

// API functions - now using actual service
const fetchTasks = async () => {
  isLoading.value = true
  error.value = null

  try {
    const filters = {
      status: statusFilter.value,
      priority: priorityFilter.value,
      category: categoryFilter.value,
      search: searchQuery.value
    }

    const result = await taskService.getTasks(filters)

    console.log('Task fetch result:', result)

    if (result.success) {
      console.log('Raw tasks data:', result.data)
      console.log('Tasks data type:', typeof result.data)
      console.log('Tasks data is array:', Array.isArray(result.data))
      tasks.value = result.data
      console.log('Tasks loaded:', tasks.value.length)
      console.log('Tasks value:', tasks.value)
      if (result.stats) {
        stats.value = result.stats
        console.log('Stats loaded:', stats.value)
      } else {
        updateStats()
      }
    } else {
      throw new Error(result.message || 'Failed to load tasks')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load tasks'
    toast.error('Failed to load tasks')
  } finally {
    isLoading.value = false
  }
}

const updateStats = () => {
  stats.value = {
    totalTasks: tasks.value.length,
    pendingTasks: tasks.value.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
    completedTasks: tasks.value.filter(t => t.status === 'completed').length,
    overdueTasks: tasks.value.filter(t => t.status === 'overdue' || isOverdue(t.dueDate)).length
  }
}

// Action handlers
const viewTask = (task: Task) => {
  selectedTask.value = task
  showViewTaskModal.value = true
}

const editTask = (task: Task) => {
  selectedTask.value = task
  showEditTaskModal.value = true
  showViewTaskModal.value = false
}

const deleteTask = async (taskId: string) => {
  if (!confirm('Are you sure you want to delete this task?')) return

  try {
    const result = await taskService.deleteTask(taskId)

    if (result.success) {
      tasks.value = tasks.value.filter(t => t._id !== taskId)
      updateStats()
      toast.success(result.message || 'Task deleted successfully')

      if (selectedTask.value?._id === taskId) {
        closeModals()
      }
    } else {
      throw new Error(result.message || 'Failed to delete task')
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete task')
  }
}

const toggleTaskStatus = async (task: Task) => {
  try {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'

    const result = await taskService.updateTask(task._id, { status: newStatus })

    if (result.success) {
      const taskIndex = tasks.value.findIndex(t => t._id === task._id)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        updateStats()
        toast.success(`Task marked as ${newStatus}`)
      }
    } else {
      throw new Error(result.message || 'Failed to update task status')
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to update task status')
  }
}

const handleTaskSave = async (taskData: Partial<Task>) => {
  try {
    console.log('Saving task data:', taskData)

    if (showEditTaskModal.value && selectedTask.value) {
      console.log('Updating existing task:', selectedTask.value._id)
      // Update existing task
      const result = await taskService.updateTask(selectedTask.value._id, taskData)

      console.log('Update result:', result)

      if (result.success && result.data) {
        const taskIndex = tasks.value.findIndex(t => t._id === selectedTask.value!._id)
        if (taskIndex !== -1) {
          tasks.value[taskIndex] = result.data
        }
        toast.success('Task updated successfully')
      } else {
        throw new Error(result.message || 'Failed to update task')
      }
    } else {
      console.log('Creating new task')
      // Create new task
      const result = await taskService.createTask(taskData as CreateTaskRequest)

      console.log('Create result:', result)

      if (result.success && result.data) {
        tasks.value.unshift(result.data)
        toast.success('Task created successfully')
      } else {
        throw new Error(result.message || 'Failed to create task')
      }
    }

    updateStats()
    closeModals()
  } catch (error: any) {
    console.error('Task save error:', error)
    toast.error(error.message || 'Failed to save task')
  }
}

const closeModals = () => {
  showCreateTaskModal.value = false
  showEditTaskModal.value = false
  showViewTaskModal.value = false
  selectedTask.value = null
}

// Lifecycle
onMounted(() => {
  if (authStore.user?.role !== 'staff') {
    toast.error('Access denied: This page is only accessible to staff members')
    return
  }
  fetchTasks()
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
