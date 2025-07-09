<template>
  <form 
    @submit.prevent="login"
    style="background-color: white; padding: 2rem; border-radius: 0.75rem; max-width: 500px; margin: 4rem auto; "
  >
    <!-- Heading -->
    <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem; text-align: center;">
      Welcome Back
    </h2>

    <!-- Email Field -->
    <div style="margin-bottom: 1.25rem;">
      <label for="email" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Email</label>
      <input 
        v-model="email" 
        id="email" 
        type="email" 
        placeholder="Enter your email"
        required
        style="margin-top: 0.25rem; display: block; width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 1rem; outline: none; color: #111827; transition: 0.2s ease;"
        onfocus="this.style.borderColor='#10B981'; this.style.boxShadow='0 0 0 2px rgba(16,185,129,0.3)';"
        onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"
      />
    </div>

    <!-- Password Field -->
    <div style="margin-bottom: 0.75rem;">
      <label for="password" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Password</label>
      <div style="position: relative;">
        <input 
          :type="showPassword ? 'text' : 'password'"
          v-model="password" 
          id="password" 
          placeholder="Enter your password"
          required
          style="margin-top: 0.25rem; display: block; width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 1rem; outline: none; color: #111827; transition: 0.2s ease;"
          onfocus="this.style.borderColor='#10B981'; this.style.boxShadow='0 0 0 2px rgba(16,185,129,0.3)';"
          onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"
        />
        <button 
          type="button" 
          @click="togglePassword"
          style="position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); font-size: 0.875rem; color: #6B7280; background: none; border: none; cursor: pointer;"
        >
          {{ showPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
    </div>

    <!-- Forgot Password -->
    <div style="text-align: right; margin-bottom: 1.25rem;">
      <RouterLink to="/forgot-password" style="font-size: 0.875rem; color: #10B981; text-decoration: none;">
        Forgot password?
      </RouterLink>
    </div>

    <!-- Login Button -->
    <div style="margin-bottom: 1rem;">
      <button 
        type="submit"
        style="width: 100%; background-color: #10B981; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; border: none; cursor: pointer; transition: background-color 0.2s ease;"
        onmouseover="this.style.backgroundColor='#059669';"
        onmouseout="this.style.backgroundColor='#10B981';"
      >
        Login
      </button>
    </div>

    <!-- Faint Message -->
    <p style="text-align: center; font-size: 0.75rem; color: #9CA3AF; filter: blur(0.4px); margin-top: 0.5rem;">
      Enter your credentials to access your dashboard
    </p>
  </form>
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
const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}


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
