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
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="terms"
                  v-model="acceptTerms"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="terms" class="text-gray-600">
                  I agree to the
                  <router-link to="/terms-conditions" class="text-blue-600 hover:text-blue-500">Terms of Service</router-link>
                  and
                  <router-link to="/privacy-policy" class="text-blue-600 hover:text-blue-500">Privacy Policy</router-link>
                  *
                </label>
              </div>
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
import { Menu, X, LogIn, Eye, EyeOff } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const showPassword = ref(false)
const email = ref('')
const password = ref('')
const companyId = ref('')
const isLoading = ref(false)
const acceptTerms = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  try {
    if (!acceptTerms.value) {
    toast.error('You must accept the terms and conditions')
    return
  }
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        companyId: companyId.value,
        acceptedTermsAndConditionAndPrivacyAndPolicy:acceptTerms.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('userRole', data.user.role)

    auth.login(data.token, data.user)
    toast.success('Login successful! ✅')

    // Redirect based on user role from backend response
    const userRole = data.user.role?.toLowerCase()

    if (userRole === 'admin' || userRole === 'administrator') {
      router.push('/dashboard')
    } else if (userRole === 'staff' || userRole === 'patient') {
      router.push('/user-dashboard')
    } else {
      // Default fallback
      router.push('/user-dashboard')
    }
  } catch (err: any) {
    toast.error('Login failed: ' + err.message)
  }

  isLoading.value = false
}
</script>
