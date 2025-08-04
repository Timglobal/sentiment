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

      <div class="grid gap-4">
        <Card v-for="worker in workers" :key="worker.id">
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
                  <p class="text-sm text-gray-600">{{ worker.role }} • {{ worker.department }}</p>
                  <p class="text-sm text-gray-500">{{ worker.email }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <Badge 
                  :class="worker.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ worker.status }}
                </Badge>
                <Button 
                  @click="editWorker(worker)" 
                  variant="outline" 
                  size="sm"
                >
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Add Worker Modal placeholder -->
      <div 
        v-if="showAddModal" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click="closeAddModal"
      >
        <div 
          class="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          @click.stop
        >
          <h3 class="text-lg font-semibold mb-4">Add New Worker</h3>
          <form @submit.prevent="addWorker" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                v-model="newWorker.name"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input 
                v-model="newWorker.role"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input 
                v-model="newWorker.department"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                v-model="newWorker.email"
                type="email" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div class="flex space-x-3">
              <Button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700">Add Worker</Button>
              <Button 
                type="button" 
                @click="closeAddModal" 
                variant="outline" 
                class="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { Plus } from 'lucide-vue-next'

interface Worker {
  id: number
  name: string
  role: string
  department: string
  status: string
  email: string
}

const workers = ref<Worker[]>([
  {
    id: 1,
    name: "John Smith",
    role: "Nurse",
    department: "Emergency",
    status: "Active",
    email: "john.smith@hospital.com",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Doctor",
    department: "Cardiology",
    status: "Active",
    email: "sarah.johnson@hospital.com",
  },
  {
    id: 3,
    name: "Mike Wilson",
    role: "Technician",
    department: "Radiology",
    status: "Inactive",
    email: "mike.wilson@hospital.com",
  },
])

const showAddModal = ref(false)
const newWorker = ref({
  name: '',
  role: '',
  department: '',
  email: '',
  status: 'Active'
})

const openAddModal = () => {
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newWorker.value = {
    name: '',
    role: '',
    department: '',
    email: '',
    status: 'Active'
  }
}

const addWorker = () => {
  const worker: Worker = {
    id: workers.value.length + 1,
    ...newWorker.value
  }
  workers.value.push(worker)
  closeAddModal()
}

const editWorker = (worker: Worker) => {
  console.log('Edit worker:', worker)
  // Implement edit functionality
}
</script>
