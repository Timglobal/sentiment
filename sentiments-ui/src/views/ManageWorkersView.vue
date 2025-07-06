<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-blue-700 mb-6">Manage Workers</h2>

    <!-- Add Worker Form -->
    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <input v-model="form.name" placeholder="Name" class="border px-3 py-2 rounded" required />
      <input v-model="form.role" placeholder="Role (e.g. Nurse, Doctor)" class="border px-3 py-2 rounded" required />
      <input v-model="form.position" placeholder="Position (e.g. Senior, Assistant)" class="border px-3 py-2 rounded" required />
      <input v-model="form.strengths" placeholder="Strengths" class="border px-3 py-2 rounded" />
      <input v-model="form.weaknesses" placeholder="Weaknesses" class="border px-3 py-2 rounded" />
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded col-span-full">
        {{ isEditing ? 'Update Worker' : 'Add Worker' }}
      </button>
    </form>

    <!-- Workers Table -->
    <table class="w-full border">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 text-left">Name</th>
          <th class="p-2 text-left">Role</th>
          <th class="p-2 text-left">Position</th>
          <th class="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="worker in workers" :key="worker._id">
          <td class="p-2">{{ worker.name }}</td>
          <td class="p-2">{{ worker.role }}</td>
          <td class="p-2">{{ worker.position }}</td>
          <td class="p-2 space-x-2">
            <button @click="editWorker(worker)" class="text-blue-600 hover:underline">Edit</button>
            <button @click="deleteWorker(worker._id)" class="text-red-600 hover:underline">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { API_BASE_URL } from '@/config'

const toast = useToast()

const workers = ref<any[]>([])
const form = ref({
  name: '',
  role: '',
  position: '',
  strengths: '',
  weaknesses: ''
})
const isEditing = ref(false)
const editId = ref<string | null>(null)

async function fetchWorkers() {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE_URL}/workers`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  workers.value = data
}

function resetForm() {
  form.value = { name: '', role: '', position: '', strengths: '', weaknesses: '' }
  isEditing.value = false
  editId.value = null
}

async function handleSubmit() {
  const token = localStorage.getItem('token')
  const method = isEditing.value ? 'PUT' : 'POST'
  const url = isEditing.value
    ? `${API_BASE_URL}/workers/${editId.value}`
    : `${API_BASE_URL}/workers`

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form.value)
    })

    if (!res.ok) throw new Error('Error saving worker')

    toast.success(isEditing.value ? 'Worker updated ✅' : 'Worker added ✅')
    await fetchWorkers()
    resetForm()
  } catch (err: any) {
    toast.error(err.message || 'Action failed ❌')
  }
}

function editWorker(worker: any) {
  form.value = { ...worker }
  editId.value = worker._id
  isEditing.value = true
}

async function deleteWorker(id: string) {
  const token = localStorage.getItem('token')
  if (!confirm('Are you sure you want to delete this worker?')) return

  try {
    const res = await fetch(`${API_BASE_URL}/workers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) throw new Error('Delete failed ❌')

    toast.success('Worker deleted ✅')
    await fetchWorkers()
  } catch (err: any) {
    toast.error(err.message || 'Delete failed ❌')
  }
}

onMounted(() => {
  fetchWorkers()
})
</script>
