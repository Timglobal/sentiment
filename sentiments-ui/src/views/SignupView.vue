<template>
  <form 
    @submit.prevent="register"
    style="background-color: white; padding: 2rem; border-radius: 0.75rem; max-width: 500px; margin: 4rem auto;"
  >
    <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem; text-align: center;">
      Create Your Account
    </h2>

    <!-- Name -->
    <div style="margin-bottom: 1.25rem;">
      <label for="name" style="display: block; margin-bottom: 0.25rem;">Name</label>
      <input v-model="name" id="name" type="text" placeholder="Full name" required :style="inputStyle" />
    </div>

    <!-- Email -->
    <div style="margin-bottom: 1.25rem;">
      <label for="email" style="display: block; margin-bottom: 0.25rem;">Email</label>
      <input v-model="email" id="email" type="email" placeholder="Email address" required :style="inputStyle" />
    </div>

    <!-- Password + Toggle -->
    <div style="margin-bottom: 1.25rem;">
      <label for="password" style="display: block; margin-bottom: 0.25rem;">Password</label>
      <div style="position: relative;">
        <input 
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          id="password"
          placeholder="Choose a password"
          required
          :style="inputStyle"
        />
        <button type="button" @click="showPassword = !showPassword"
          style="position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); background: none; border: none; font-size: 0.85rem; color: #6B7280; cursor: pointer;">
          {{ showPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
    </div>

    <!-- Role -->
    <div style="margin-bottom: 1.25rem;">
      <label for="role" style="display: block; margin-bottom: 0.25rem;">Role</label>
      <select v-model="role" id="role" required :style="inputStyle">
        <option disabled value="">Select role</option>
        <option>admin</option>
        <option>nurse</option>
        <option>doctor</option>
        <option>staff</option>
        <option>patient</option>
      </select>
    </div>

    <!-- Profile Image Upload -->
    <div style="margin-bottom: 1.25rem;">
      <label for="avatar" style="display: block; margin-bottom: 0.5rem;">Upload Profile Photo</label>
      <input id="avatar" type="file" accept="image/*" @change="handleAvatar" />
      <div v-if="avatarUrl" style="margin-top: 1rem; text-align: center;">
        <img :src="avatarUrl" alt="Preview" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" />
      </div>
    </div>

    <!-- Submit -->
    <div style="margin-bottom: 1rem;">
      <button type="submit" :style="submitStyle">Sign Up</button>
    </div>

    <!-- Switch to login -->
    <p style="text-align: center; font-size: 0.875rem; color: #6B7280;">
      Already have an account?
      <RouterLink to="/login" style="color: #10B981;">Login here</RouterLink>
    </p>
  </form>
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
const role = ref('')
const avatarUrl = ref<string | null>(null)
const showPassword = ref(false)

const router = useRouter()

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

function handleAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    avatarUrl.value = URL.createObjectURL(file)
  }
}

async function register() {
  try {
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('email', email.value)
    formData.append('password', password.value)
    formData.append('role', role.value)

    if ((document.getElementById('avatar') as HTMLInputElement).files?.[0]) {
      formData.append('avatar', (document.getElementById('avatar') as HTMLInputElement).files![0])
    }

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData
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
