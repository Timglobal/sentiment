<template>
  <div style="max-width: 600px; margin: 60px auto; padding: 24px; font-family: Arial, sans-serif;">
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Join the Waitlist</h2>
    <form @submit.prevent="submitForm" style="display: flex; flex-direction: column; gap: 16px;">
      
      <input v-model="form.name" type="text" placeholder="Your full name" required
        style="padding: 12px; border: 1px solid #ccc; border-radius: 6px;" />

      <input v-model="form.email" type="email" placeholder="Email address" required
        style="padding: 12px; border: 1px solid #ccc; border-radius: 6px;" />

      <input v-model="form.company" type="text" placeholder="Company (optional)"
        style="padding: 12px; border: 1px solid #ccc; border-radius: 6px;" />

      <input v-model="form.purpose" type="text" placeholder="Why are you interested?"
        style="padding: 12px; border: 1px solid #ccc; border-radius: 6px;" />

      <textarea v-model="form.feedback" placeholder="Additional feedback (optional)" rows="4"
        style="padding: 12px; border: 1px solid #ccc; border-radius: 6px;"></textarea>

      <button type="submit"
        style="padding: 12px; background-color: #2563eb; color: white; font-weight: bold; border: none; border-radius: 6px;">
        Save
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toastification'

const toast = useToast()
const route = useRoute()

const form = ref({
  name: '',
  email: '',
  company: '',
  purpose: '',
  feedback: ''
})

onMounted(() => {
  const emailFromQuery = route.query.email
  if (emailFromQuery) form.value.email = emailFromQuery
})

async function submitForm() {
  try {
    const res = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.message)

    toast.success('You’ve been added to the waitlist! ✅')
    form.value = { name: '', email: '', company: '', purpose: '', feedback: '' }
  } catch (err) {
    toast.error(err.message || 'Something went wrong.')
  }
}
</script>
