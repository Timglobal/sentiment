<template>
  <div>
    <!-- Dialog Trigger -->
    <Button
      variant="outline"
      class="w-full justify-start bg-transparent"
      @click="isOpen = true"
    >
      <Users class="w-4 h-4 mr-2" />
      {{ selectedWorker ? selectedWorker.name : placeholder }}
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
              :placeholder="getSearchPlaceholder()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="max-h-64 overflow-y-auto">
            <div v-if="isLoading" class="flex justify-center py-8">
              <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div v-else class="space-y-2">
              <div
                v-if="filteredWorkers.length > 0"
                v-for="worker in filteredWorkers"
                :key="worker._id"
                :class="[
                  'p-3 border rounded-lg cursor-pointer transition-colors hover:border-blue-300 hover:bg-blue-50',
                  selectedWorker?._id === worker._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                ]"
                @click="handleWorkerSelect(worker)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ worker.name }}</p>
                    <p class="text-sm text-gray-600">
                      {{ worker.role === 'staff' ? 'Staff' : 'Patient' }}
                      <span v-if="worker.department"> • {{ worker.department }}</span>
                    </p>
                    <p class="text-xs text-gray-500">{{ worker.email }}</p>
                  </div>
                  <div class="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                    <div
                      v-if="selectedWorker?._id === worker._id"
                      class="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <p
                v-else
                class="text-gray-500 text-center py-4"
              >
                {{ isLoading ? 'Loading workers...' : 'No workers found matching your search' }}
              </p>
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

    <!-- Selected Worker Badge -->
    <div v-if="selectedWorker" class="mt-2">
      <Badge variant="secondary" class="flex items-center gap-1 w-fit">
        {{ selectedWorker.name }} - {{ selectedWorker.role === 'staff' ? 'Staff' : 'Patient' }}
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
import { Users, X } from 'lucide-vue-next'
import { useWorkers } from '@/composables/useWorkers'
import { useAuthStore } from '@/stores/auth'
import type { Worker } from '@/services/workerService'

interface Props {
  selectedWorker: Worker | null
  triggerLabel?: string
  placeholder?: string
  roleFilter?: 'staff' | 'patient' | null
}

const props = withDefaults(defineProps<Props>(), {
  triggerLabel: 'Select Worker',
  placeholder: 'Search and select a worker',
  roleFilter: null
})

const emit = defineEmits<{
  'worker-select': [worker: Worker | null]
}>()

// Use workers composable and auth store
const { workers, fetchWorkers, isLoading } = useWorkers()
const authStore = useAuthStore()

const isOpen = ref(false)
const searchQuery = ref('')

const handleWorkerSelect = (worker: Worker) => {
  emit('worker-select', worker)
  isOpen.value = false
  searchQuery.value = ''
}

const handleClose = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const handleClearSelection = () => {
  emit('worker-select', null)
}

// Get appropriate search placeholder based on context
const getSearchPlaceholder = () => {
  const userRole = authStore.user?.role

  if (userRole === 'patient') {
    return 'Search staff members by name, role, or department...'
  } else if (userRole === 'staff') {
    return 'Search staff and patients by name, role, or department...'
  } else if (userRole === 'admin') {
    return 'Search all users by name, role, or department...'
  }

  return 'Search workers by name, role, or department...'
}

// Filter workers based on search query, role filter, and user permissions
const filteredWorkers = computed(() => {
  let filtered = workers.value
  const userRole = authStore.user?.role

  // Apply role-based visibility rules
  if (userRole === 'patient') {
    // Patients can only see staff members
    filtered = filtered.filter(worker => worker.role === 'staff')
  } else if (userRole === 'staff') {
    // Staff can see both patients and other staff
    filtered = filtered.filter(worker =>
      worker.role === 'staff' || worker.role === 'patient'
    )
  } else if (userRole === 'admin') {
    // Admin can see everyone (staff and patients)
    filtered = filtered.filter(worker =>
      worker.role === 'staff' || worker.role === 'patient'
    )
  }

  // Apply additional role filter if specified (this overrides the above logic)
  if (props.roleFilter) {
    filtered = filtered.filter(worker => worker.role === props.roleFilter)
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (worker) =>
        worker.name.toLowerCase().includes(query) ||
        worker.email.toLowerCase().includes(query) ||
        worker.role.toLowerCase().includes(query) ||
        (worker.department && worker.department.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Fetch workers when component mounts
onMounted(() => {
  if (workers.value.length === 0) {
    fetchWorkers()
  }
})
</script>
