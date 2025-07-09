<template>
  <form 
    @submit.prevent="handleForgot"
    style="background-color: white; padding: 2rem; border-radius: 0.75rem; max-width: 500px; margin: 4rem auto;"
  >
    <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem; text-align: center;">
      Forgot Password
    </h2>

    <div style="margin-bottom: 1.25rem;">
      <label for="email" style="font-size: 0.875rem; font-weight: 500; color: #374151;">Enter your registered email</label>
      <input 
        v-model="email"
        id="email"
        type="email"
        required
        placeholder="you@example.com"
        style="margin-top: 0.25rem; width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; outline: none;"
      />
    </div>

    <button 
      type="submit"
      style="width: 100%; background-color: #10B981; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; border: none; cursor: pointer;"
    >
      Send Reset Link
    </button>

    <p style="margin-top: 1rem; font-size: 0.75rem; color: #6B7280; text-align: center;">
      We'll email you a password reset link.
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { API_BASE_URL } from '@/config'

const email = ref('')
const toast = useToast()

async function handleForgot() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success(data.message + ' 📬')
  } catch (err: any) {
    toast.error('Error: ' + err.message)
  }
}
</script>
