<template>
  <div class="max-w-sm mx-auto">
    <h2 class="text-xl font-semibold mb-4">Sign Up</h2>
    <form @submit.prevent="register">
      <label class="block mb-2">Name</label>
      <input v-model="name" class="w-full border px-3 py-2 mb-4" type="text" />

      <label class="block mb-2">Email</label>
      <input v-model="email" class="w-full border px-3 py-2 mb-4" type="email" />

      <label class="block mb-2">Password</label>
      <input v-model="password" class="w-full border px-3 py-2 mb-4" type="password" />

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Sign Up</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { API_BASE_URL } from '@/config'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
const toast = useToast()


const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

async function register() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, password: password.value, role: 'admin' })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success('Registration successful!')
    router.push('/login')
  } catch (err: any) {
    toast.error('Signup failed: ' + err.message)
  }
}
</script>
