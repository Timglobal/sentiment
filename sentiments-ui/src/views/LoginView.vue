<!-- src/views/LoginView.vue -->
<template>
  <div class="max-w-sm mx-auto">
    <h2 class="text-xl font-semibold mb-4">Login</h2>
    <form @submit.prevent="login">
      <label class="block mb-2">Email</label>
      <input v-model="email" class="w-full border px-3 py-2 mb-4" type="email" />

      <label class="block mb-2">Password</label>
      <input v-model="password" class="w-full border px-3 py-2 mb-4" type="password" />

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()

const toast = useToast()

const email = ref('')
const password = ref('')
const router = useRouter()

async function login() {
    try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.message)

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    auth.login(data.token, data.user)
    toast.success('Login successful! ✅')
    router.push('/dashboard')
  } catch (err: any) {
    toast.error('Login failed: ' + err.message)
  }
}
</script>
