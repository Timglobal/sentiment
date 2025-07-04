<!-- src/views/ContactView.vue -->
<template>
  <div class="max-w-md mx-auto">
    <h2 class="text-xl font-semibold mb-4">Contact Us</h2>
    <form @submit.prevent="submitForm">
      <label class="block mb-2">Name</label>
      <input v-model="name" class="w-full border px-3 py-2 mb-4" />

      <label class="block mb-2">Email</label>
      <input v-model="email" class="w-full border px-3 py-2 mb-4" />

      <label class="block mb-2">Message</label>
      <textarea v-model="message" class="w-full border px-3 py-2 mb-4"></textarea>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toastification'
const toast = useToast()

const name = ref('')
const email = ref('')
const message = ref('')

async function submitForm() {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success('Message sent! ✅')
    name.value = ''
    email.value = ''
    message.value = ''
  } catch (err: any) {
    toast.error('Failed to send message: ' + err.message)
  }
}

</script>
