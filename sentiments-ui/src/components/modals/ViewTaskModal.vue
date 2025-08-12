<template>
  <Modal
    :is-open="isOpen"
    :title="`Task Details: ${task?.title || 'Task'}`"
    size="xl"
    :icon="Eye"
    icon-class="bg-blue-100"
    @close="emit('close')"
  >
    <div v-if="task" class="space-y-6">
      <!-- Task Header -->
      <div class="flex items-start justify-between pb-4 border-b border-gray-200">
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ task.title }}</h3>
          <div class="flex items-center space-x-4">
            <Badge :class="getPriorityBadgeClass(task.priority)">
              {{ getPriorityIcon(task.priority) }} {{ task.priority.toUpperCase() }}
            </Badge>
            <Badge :class="getStatusBadgeClass(task.status)">
              {{ getStatusIcon(task.status) }} {{ task.status.toUpperCase().replace('-', ' ') }}
            </Badge>
            <span class="text-sm text-gray-500">{{ task.category }}</span>
          </div>
        </div>
        <div class="flex items-center space-x-2 ml-4">
          <Button
            @click="emit('edit', task)"
            size="sm"
            variant="outline"
            class="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Edit class="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            @click="emit('toggle-status', task)"
            size="sm"
            :class="task.status === 'completed'
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'"
          >
            <CheckCircle v-if="task.status !== 'completed'" class="w-4 h-4 mr-1" />
            <RotateCcw v-else class="w-4 h-4 mr-1" />
            {{ task.status === 'completed' ? 'Reopen' : 'Complete' }}
          </Button>
        </div>
      </div>

      <!-- Task Information Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-4">
          <!-- Description -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ task.description }}</p>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="task.tags && task.tags.length > 0">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="tag in task.tags"
                :key="tag"
                class="bg-blue-100 text-blue-800 border-blue-200"
              >
                {{ tag }}
              </Badge>
            </div>
          </div>

          <!-- Time Tracking -->
          <div v-if="task.estimatedHours || task.actualHours">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Time Tracking</h4>
            <div class="bg-gray-50 p-4 rounded-lg space-y-2">
              <div v-if="task.estimatedHours" class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Estimated:</span>
                <span class="text-sm font-medium text-gray-900">{{ task.estimatedHours }} hours</span>
              </div>
              <div v-if="task.actualHours" class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Actual:</span>
                <span class="text-sm font-medium text-gray-900">{{ task.actualHours }} hours</span>
              </div>
              <div v-if="task.estimatedHours && task.actualHours" class="pt-2 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Variance:</span>
                  <span class="text-sm font-medium" :class="getVarianceClass(task.estimatedHours, task.actualHours)">
                    {{ getTimeVariance(task.estimatedHours, task.actualHours) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-4">
          <!-- Due Date Info -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">Due Date</h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center space-x-2 mb-2">
                <Calendar class="w-4 h-4 text-gray-500" />
                <span class="text-sm font-medium text-gray-900">{{ formatDate(task.dueDate) }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Clock class="w-4 h-4 text-gray-500" />
                <span class="text-sm" :class="isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'">
                  {{ getTimeRemaining(task.dueDate) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Task Timeline -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
            <div class="bg-gray-50 p-4 rounded-lg space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Created:</span>
                <span class="text-sm text-gray-900">{{ formatDate(task.createdAt) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Last Updated:</span>
                <span class="text-sm text-gray-900">{{ formatDate(task.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Indicator -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">Progress</h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Status Progress</span>
                <span class="text-sm font-medium text-gray-900">{{ getProgressPercentage(task.status) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getProgressBarClass(task.status)"
                  :style="{ width: `${getProgressPercentage(task.status)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div class="space-y-2">
              <Button
                @click="duplicateTask"
                size="sm"
                variant="outline"
                class="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Copy class="w-4 h-4 mr-2" />
                Duplicate Task
              </Button>
              <Button
                @click="shareTask"
                size="sm"
                variant="outline"
                class="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                <Share2 class="w-4 h-4 mr-2" />
                Share Task
              </Button>
              <Button
                @click="exportTask"
                size="sm"
                variant="outline"
                class="w-full text-indigo-600 border-indigo-300 hover:bg-indigo-50"
              >
                <Download class="w-4 h-4 mr-2" />
                Export Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Notes Section (if any) -->
      <div v-if="task.notes" class="pt-4 border-t border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Notes</h4>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ task.notes }}</p>
        </div>
      </div>

      <!-- Warning for Overdue Tasks -->
      <div v-if="isOverdue(task.dueDate) && task.status !== 'completed'" class="bg-red-50 p-4 rounded-lg border border-red-200">
        <div class="flex items-start space-x-3">
          <AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="text-sm font-medium text-red-900">Task Overdue</h4>
            <p class="text-sm text-red-800 mt-1">
              This task is {{ Math.abs(Math.floor((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) }}
              day(s) overdue. Consider updating the due date or marking it as completed.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center pt-4 border-t border-gray-200">
        <Button
          @click="confirmDelete"
          variant="outline"
          class="text-red-600 border-red-300 hover:bg-red-50"
        >
          <Trash2 class="w-4 h-4 mr-2" />
          Delete Task
        </Button>
        <div class="flex items-center space-x-3">
          <Button
            @click="emit('close')"
            variant="outline"
          >
            Close
          </Button>
          <Button
            @click="emit('edit', task)"
            class="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit class="w-4 h-4 mr-2" />
            Edit Task
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toast-notification'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  Eye, Edit, CheckCircle, RotateCcw, Calendar, Clock, Copy, Share2,
  Download, AlertTriangle, Trash2
} from 'lucide-vue-next'

// Props
interface Props {
  isOpen: boolean
  task?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  edit: [task: any]
  delete: [taskId: string]
  'toggle-status': [task: any]
}>()

// Composables
const toast = useToast()

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
  return new Date(dueDateString) < new Date()
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

const getProgressPercentage = (status: string) => {
  const percentages = {
    pending: 0,
    'in-progress': 50,
    completed: 100,
    overdue: 25
  }
  return percentages[status as keyof typeof percentages] || 0
}

const getProgressBarClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-500',
    'in-progress': 'bg-blue-500',
    completed: 'bg-green-500',
    overdue: 'bg-red-500'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-500'
}

const getTimeVariance = (estimated: number, actual: number) => {
  const variance = actual - estimated
  const percentage = Math.round((variance / estimated) * 100)

  if (variance > 0) {
    return `+${variance}h (+${percentage}%)`
  } else if (variance < 0) {
    return `${variance}h (${percentage}%)`
  } else {
    return 'On target'
  }
}

const getVarianceClass = (estimated: number, actual: number) => {
  const variance = actual - estimated
  const percentage = (variance / estimated) * 100

  if (percentage > 20) {
    return 'text-red-600'
  } else if (percentage < -20) {
    return 'text-green-600'
  } else {
    return 'text-gray-900'
  }
}

// Action handlers
const duplicateTask = () => {
  // Emit an event to create a new task with the same data
  toast.info('Task duplication feature coming soon!')
}

const shareTask = () => {
  // Copy task details to clipboard or share
  if (navigator.clipboard && props.task) {
    const taskDetails = `Task: ${props.task.title}\nDescription: ${props.task.description}\nDue: ${formatDate(props.task.dueDate)}\nPriority: ${props.task.priority}`
    navigator.clipboard.writeText(taskDetails)
    toast.success('Task details copied to clipboard!')
  } else {
    toast.info('Task sharing feature coming soon!')
  }
}

const exportTask = () => {
  // Export task details as JSON or text
  if (props.task) {
    const taskData = {
      ...props.task,
      exportedAt: new Date().toISOString()
    }
    const dataStr = JSON.stringify(taskData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `task-${props.task.title.replace(/\s+/g, '-').toLowerCase()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    toast.success('Task exported successfully!')
  }
}

const confirmDelete = () => {
  if (props.task && confirm(`Are you sure you want to delete the task "${props.task.title}"? This action cannot be undone.`)) {
    emit('delete', props.task._id)
  }
}
</script>

<style scoped>
/* Custom scrollbar for long content */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
