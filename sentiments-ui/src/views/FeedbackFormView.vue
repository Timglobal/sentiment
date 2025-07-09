<template>
  <form 
    @submit.prevent="submitFeedback"
    style="background-color: white; padding: 2rem; border-radius: 0.75rem; max-width: 500px; margin: 4rem auto;"
  >
    <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem; text-align: center;">
      Submit Feedback
    </h2>

    <!-- Name -->
    <div style="margin-bottom: 1.25rem;">
      <label for="name" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Your Name</label>
      <input 
        v-model="name" 
        id="name" 
        type="text" 
        required 
        placeholder="Full name"
        :style="inputStyle"
      />
    </div>

    <!-- Email -->
    <div style="margin-bottom: 1.25rem;">
      <label for="email" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Email</label>
      <input 
        v-model="email" 
        id="email" 
        type="email" 
        required 
        placeholder="Email address"
        :style="inputStyle"
      />
    </div>

    <!-- Worker Select -->
    <div style="margin-bottom: 1.25rem;">
      <label for="worker" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Feedback about</label>
      <select v-model="selectedWorkerId" id="worker" required :style="inputStyle">
        <option disabled value="">-- Select Worker --</option>
        <option v-for="worker in workers" :key="worker._id" :value="worker._id">
          {{ worker.name }} ({{ worker.role }})
        </option>
      </select>
    </div>

    <!-- Source -->
    <div style="margin-bottom: 1.25rem;">
      <label for="source" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">You are a:</label>
      <select v-model="source" id="source" required :style="inputStyle">
        <option disabled value="">-- Select --</option>
        <option value="patient">User</option>
        <option value="colleague">Colleague</option>
      </select>
    </div>

    <!-- Message -->
    <div style="margin-bottom: 1.5rem;">
      <label for="message" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Message</label>
      <textarea 
        v-model="message" 
        id="message" 
        required 
        placeholder="Write your feedback here..."
        rows="4"
        :style="inputStyle"
      />
    </div>

    <!-- Submit Button -->
    <button 
      type="submit"
      :style="submitStyle"
    >
      Send Feedback
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref , onMounted } from 'vue'
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

// Styles
const inputStyle = `
  margin-top: 0.25rem; display: block; width: 100%;
  border: 1px solid #E5E7EB; border-radius: 0.5rem;
  padding: 0.75rem 1rem; font-size: 1rem;
  outline: none; color: #111827;
  transition: 0.2s ease;
`

const submitStyle = `
  width: 100%; background-color: #10B981; color: white;
  padding: 0.75rem 1rem; border-radius: 0.5rem;
  font-size: 1rem; font-weight: 600; border: none;
  cursor: pointer; transition: background-color 0.2s ease;
`

// Load workers
async function fetchWorkers() {
  try {
    const res = await fetch(`${API_BASE_URL}/workers`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    workers.value = await res.json()
  } catch {
    toast.error('Failed to load workers')
  }
}

onMounted(() => {
  fetchWorkers()
})

// Submit feedback
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
        source: source.value
      })
    })

    if (!res.ok) throw new Error('Submission failed.')

    toast.success('✅ Feedback submitted!')
    name.value = ''
    email.value = ''
    message.value = ''
    selectedWorkerId.value = ''
    source.value = ''
  } catch (err: any) {
    toast.error('❌ Error: ' + err.message)
  }
}
</script>
