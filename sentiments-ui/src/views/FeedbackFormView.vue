<template>
  <div class="max-w-md mx-auto">
    <h2 class="text-xl font-semibold mb-4">Submit Feedback</h2>
    <form @submit.prevent="submitFeedback">
      <label class="block mb-2">Name</label>
      <input v-model="name" class="w-full border px-3 py-2 mb-4" />

      <label class="block mb-2">Email</label>
      <input v-model="email" class="w-full border px-3 py-2 mb-4" type="email" />

      <label class="block mb-2">Who is this feedback about?</label>
      <select v-model="selectedWorkerId" class="w-full border px-3 py-2 mb-4">
        <option disabled value="">-- Select Worker --</option>
        <option v-for="worker in workers" :key="worker._id" :value="worker._id">
            {{ worker.name }} ({{ worker.role }})
        </option>
      </select>

      <label class="block mb-2">I am a:</label>
      <select v-model="source" class="w-full border px-3 py-2 mb-4" required>
        <option disabled value="">-- Select Source --</option>
        <option value="patient">User</option>
        <option value="colleague">Colleague</option>
      </select>   

      <label class="block mb-2">Message</label>
      <textarea v-model="message" class="w-full border px-3 py-2 mb-4" />

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref , onMounted} from 'vue'
import { useToast } from 'vue-toastification'
import { API_BASE_URL } from '@/config'

interface Worker {
  _id: string
  name: string
  role: string
}

const name = ref('')
const email = ref('')
const message = ref('')
const selectedWorkerId = ref('')
const workers = ref<Worker[]>([])
const toast = useToast()
const source = ref('')


async function fetchWorkers() {
  try {
    const res = await fetch(`${API_BASE_URL}/workers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })
    workers.value = await res.json()
  } catch (err) {
    toast.error('Failed to load workers')
  }
}

onMounted(() => {
  fetchWorkers()
})

async function submitFeedback() {
  try {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value,
        workerId: selectedWorkerId.value,
        source: source.value || 'user'
      })
    })

    if (!res.ok) throw new Error('Submission failed.')

    toast.success('✅ Feedback submitted!')
    name.value = ''
    email.value = ''
    message.value = ''
    selectedWorkerId.value = ''
  } catch (err: any) {
    toast.error('❌ Error: ' + err.message)
  }
}
</script>
