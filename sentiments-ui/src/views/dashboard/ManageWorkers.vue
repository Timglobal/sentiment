<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Manage Workers</h2>
          <p class="text-gray-600">Add, edit, and manage your team members</p>
        </div>
        <Button @click="openAddModal" class="bg-blue-600 hover:bg-blue-700">
          <Plus class="w-4 h-4 mr-2" />
          Add Worker
        </Button>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or email..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Role Filter -->
          <div class="sm:w-48">
            <select
              v-model="selectedRoleFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="staff">Staff Only</option>
              <option value="patient">Patients Only</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="sm:w-48">
            <select
              v-model="selectedStatusFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <!-- Results Summary -->
        <div class="mt-3 text-sm text-gray-600">
          Showing {{ filteredWorkers.length }} of {{ workers.length }} workers
        </div>
      </div>

      <!-- Workers Grid -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users class="w-8 h-8 text-red-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Workers</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <Button @click="fetchWorkers" class="bg-blue-600 hover:bg-blue-700">
          Try Again
        </Button>
      </div>

      <div v-else class="grid gap-4">
        <Card v-for="worker in filteredWorkers" :key="worker._id">
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">
                    {{ worker.name.split(' ').map(n => n[0]).join('') }}
                  </span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ worker.name }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ worker.role === 'staff' ? 'Staff' : 'Patient' }}
                    <span v-if="worker.role === 'staff' && worker.department"> • {{ worker.department }}</span>
                  </p>
                  <p class="text-sm text-gray-500">{{ worker.email }}</p>
                  <p v-if="worker.note" class="text-xs text-gray-400 mt-1">{{ worker.note }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <Badge class="bg-green-100 text-green-800">
                  Active
                </Badge>
                <Button
                  @click="openEditModal(worker)"
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  @click="handleDeleteWorker(worker)"
                  variant="outline"
                  size="sm"
                  class="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Empty State -->
        <div v-if="filteredWorkers.length === 0 && !isLoading" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No workers found</h3>
          <p class="text-gray-600 mb-4">
            {{ searchQuery || selectedRoleFilter || selectedStatusFilter
               ? 'Try adjusting your search or filters'
               : 'Get started by adding your first worker' }}
          </p>
          <Button
            v-if="!searchQuery && !selectedRoleFilter && !selectedStatusFilter"
            @click="openAddModal"
            class="bg-blue-600 hover:bg-blue-700"
          >
            <Plus class="w-4 h-4 mr-2" />
            Add First Worker
          </Button>
        </div>
      </div>

      <!-- Add Worker Modal -->
      <AddWorkerModal
        :is-open="showAddModal"
        @close="closeAddModal"
        @submit="handleAddWorker"
      />

      <!-- Edit Worker Modal -->
      <EditWorkerModal
        :is-open="showEditModal"
        :worker="selectedWorker"
        @close="closeEditModal"
        @submit="handleEditWorker"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import AddWorkerModal from '@/components/modals/AddWorkerModal.vue'
import EditWorkerModal from '@/components/modals/EditWorkerModal.vue'
import { Plus, Search, Users } from 'lucide-vue-next'
import { useWorkers } from '@/composables/useWorkers'
import type { Worker } from '@/services/workerService'

// Use the workers composable
const {
  workers,
  isLoading,
  error,
  searchQuery,
  selectedRoleFilter,
  selectedStatusFilter,
  filteredWorkers,
  fetchWorkers,
  createWorker,
  updateWorker,
  deleteWorker
} = useWorkers()

// Modal state
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedWorker = ref<Worker | null>(null)

// Modal functions
const openAddModal = () => {
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const openEditModal = (worker: Worker) => {
  selectedWorker.value = worker
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedWorker.value = null
}

// Worker management functions
const handleAddWorker = async (formData: any) => {
  const success = await createWorker(formData)
  if (success) {
    closeAddModal()
  }
}

const handleEditWorker = async (updatedWorker: Worker) => {
  const success = await updateWorker(updatedWorker._id, updatedWorker)
  if (success) {
    closeEditModal()
  }
}

const handleDeleteWorker = async (worker: Worker) => {
  if (confirm(`Are you sure you want to delete ${worker.name}?`)) {
    await deleteWorker(worker._id)
  }
}

// Initialize data
onMounted(() => {
  fetchWorkers()
})
</script>
