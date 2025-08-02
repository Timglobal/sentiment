<template>
  <div style="max-width: 900px; margin: 3rem auto; padding: 0 1rem;">
    <!-- Title -->
    <h2 style="font-size: 1.75rem; font-weight: 700; color: #10B981; margin-bottom: 2rem;">
      🛠️ Manage Workers
    </h2>

    <form
      @submit.prevent="handleSubmit"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;"
    >
      <input v-model="form.name" placeholder="Name" :style="inputStyle" required />
      <input v-model="form.role" placeholder="Role (e.g. Nurse, Doctor)" :style="inputStyle" required />
      <input v-model="form.position" placeholder="Position (e.g. Senior)" :style="inputStyle" required />
      <input v-model="form.strengths" placeholder="Strengths" :style="inputStyle" />
      <input v-model="form.weaknesses" placeholder="Weaknesses" :style="inputStyle" />

      <button
        type="submit"
        :style="buttonStyle"
        style="grid-column: 1 / -1; margin-top: 0.5rem;"
      >
        {{ isEditing ? 'Update Worker' : 'Add Worker' }}
      </button>
    </form>

    <!-- Worker List Table -->
    <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
      <thead>
        <tr style="background-color: #F9FAFB; color: #374151;">
          <th style="padding: 0.75rem; text-align: left;">Name</th>
          <th style="padding: 0.75rem; text-align: left;">Role</th>
          <th style="padding: 0.75rem; text-align: left;">Position</th>
          <th style="padding: 0.75rem; text-align: left;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="worker in workers"
          :key="worker._id"
          style="border-bottom: 1px solid #E5E7EB;"
        >
          <td style="padding: 0.75rem;">{{ worker.name }}</td>
          <td style="padding: 0.75rem;">{{ worker.role }}</td>
          <td style="padding: 0.75rem;">{{ worker.position }}</td>
          <td style="padding: 0.75rem;">
            <button
              @click="editWorker(worker)"
              style="color: #10B981; margin-right: 1rem; font-weight: 500;"
            >
              Edit
            </button>
            <button
              @click="deleteWorker(worker._id)"
              style="color: #DC2626; font-weight: 500;"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
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

const buttonStyle = `
  background-color: #10B981;
  color: white;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
`
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
