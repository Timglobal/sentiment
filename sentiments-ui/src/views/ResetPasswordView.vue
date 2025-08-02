<template>
  <div style="max-width: 500px; margin: auto; background: white; padding: 2rem; border-radius: 0.75rem;">
    <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 1rem;">Reset Your Password</h2>
    
    <form @submit.prevent="handleReset">
      <!-- New Password -->
      <div style="margin-bottom: 1.25rem;">
        <label for="password" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">New Password</label>
        <input 
          v-model="password"
          id="password"
          type="password"
          placeholder="Enter new password"
          required
          style="margin-top: 0.25rem; width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem; font-size: 1rem;"
        >
      </div>

      <!-- Confirm Password -->
      <div style="margin-bottom: 1.5rem;">
        <label for="confirm" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Confirm Password</label>
        <input 
          v-model="confirmPassword"
          id="confirm"
          type="password"
          placeholder="Confirm new password"
          required
          style="margin-top: 0.25rem; width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem; font-size: 1rem;"
        >
      </div>

      <!-- Submit -->
      <button 
        type="submit"
        style="width: 100%; background-color: #10B981; color: white; padding: 0.75rem; font-size: 1rem; font-weight: 600; border: none; border-radius: 0.5rem; cursor: pointer;"
      >
        Reset Password
      </button>

      <!-- Success message (faint) -->
      <p style="text-align: center; font-size: 0.75rem; color: #9CA3AF; filter: blur(0.3px); margin-top: 1rem;">
        Make sure your new password is strong and secure.
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toast-notification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const email = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')

onMounted(() => {
  email.value = route.query.email as string || ''
  token.value = route.query.token as string || ''
})

const handleReset = async () => {
  if (password.value !== confirmPassword.value) {
    toast.error('Passwords do not match ❌')
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        token: token.value,
        newPassword: password.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success('✅ Password reset successful! You can now log in.')
    router.push('/login')
  } catch (err: any) {
    toast.error('Reset failed: ' + err.message)
  }
}
</script>
