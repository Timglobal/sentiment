<template>
  <div class="min-h-screen relative">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      :style="{
        backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rectangle%204593-lX4NJ7jJWireON0pAXUs4iIxDCpotL.png')`
      }"
    />



    <!-- Main Content -->
    <main class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-2xl p-8 relative">
          <!-- Login Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn class="w-8 h-8 text-blue-600" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p class="text-gray-600">Sign in to your account</p>
          </div>

          <!-- Role Selection -->
          <div class="mb-6">
            <Label class="text-sm font-medium text-gray-700 mb-3 block">Login As</Label>
            <div class="grid grid-cols-3 gap-2">
              <button
                :class="[
                  'p-3 rounded-lg border-2 transition-all text-xs font-medium',
                  selectedRole === 'staff'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                ]"
                @click="selectedRole = 'staff'"
              >
                <User class="w-4 h-4 mx-auto mb-1" />
                Staff Member
              </button>
              <button
                :class="[
                  'p-3 rounded-lg border-2 transition-all text-xs font-medium',
                  selectedRole === 'admin'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                ]"
                @click="selectedRole = 'admin'"
              >
                <Shield class="w-4 h-4 mx-auto mb-1" />
                Administrator
              </button>
              <button
                :class="[
                  'p-3 rounded-lg border-2 transition-all text-xs font-medium',
                  selectedRole === 'patient'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                ]"
                @click="selectedRole = 'patient'"
              >
                <Heart class="w-4 h-4 mx-auto mb-1" />
                Patient
              </button>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <Label for="email" class="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="Enter your email"
                required
                class="w-full"
              />
            </div>

            <div>
              <Label for="password" class="text-sm font-medium text-gray-700 mb-2 block">
                Password
              </Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  required
                  class="w-full pr-10"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4 text-gray-400" />
                  <Eye v-else class="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div>
              <Label for="companyId" class="text-sm font-medium text-gray-700 mb-2 block">
                Company ID
              </Label>
              <Input
                id="companyId"
                v-model="companyId"
                type="text"
                placeholder="Enter your company ID"
                required
                class="w-full"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input type="checkbox" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                <span class="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <router-link to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-500">
                Forgot password?
              </router-link>
            </div>

            <Button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              :disabled="isLoading"
            >
              <div v-if="isLoading" class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </div>
              <div v-else class="flex items-center gap-2">
                <LogIn class="w-4 h-4" />
                Sign In
              </div>
            </Button>
          </form>

          <!-- Sign Up Link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Don't have an account?
              <router-link to="/signup" class="text-blue-600 hover:text-blue-500 font-medium">
                Sign up here
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Label from '../components/ui/Label.vue'
import { API_BASE_URL } from '@/config'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toast-notification'
import { Menu, X, LogIn, User, Shield, Eye, EyeOff, Heart } from 'lucide-vue-next'
const auth = useAuthStore()
const router = useRouter()

const toast = useToast();
const selectedRole = ref('staff')
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const companyId = ref('')
const isLoading = ref(false)
const handleLogin = async () => {
  isLoading.value = true
  try {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
      companyId: companyId.value
    })
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message)

  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  localStorage.setItem('userRole', data.user.role)

  auth.login(data.token, data.user)
  toast.success('Login successful! ✅')
    // Redirect based on role
  if (selectedRole.value === 'admin') {
    router.push('/dashboard')
  } else if (selectedRole.value === 'patient') {
    router.push('/patient-dashboard')
  } else {
    router.push('/user-dashboard')
  }
} catch (err: any) {
  toast.error('Login failed: ' + err.message)
}

  isLoading.value = false
}
</script>
