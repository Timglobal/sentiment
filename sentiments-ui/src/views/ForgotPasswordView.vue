<template>
  <div class="min-h-screen relative">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      :style="{
        backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rectangle%204593-1z1xW0ymQ36YPzEd3AgXZmJp6DVHFz.png')`
      }"
    />

    <!-- Main Content -->
    <main class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-2xl p-8 relative">
          <!-- Success State -->
          <div v-if="emailSent" class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p class="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{{ email }}</strong>
            </p>
            <div class="bg-blue-50 p-4 rounded-lg mb-6">
              <p class="text-sm text-blue-800">
                <strong>Didn't receive the email?</strong><br>
                Check your spam folder or
                <button
                  @click="resetForm"
                  class="text-blue-600 hover:text-blue-500 underline font-medium"
                >
                  try again
                </button>
              </p>
            </div>
            <Button
              @click="$router.push('/login')"
              class="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
            >
              <ArrowLeft class="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>

          <!-- Forgot Password Form -->
          <div v-else>
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key class="w-8 h-8 text-orange-600" />
              </div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
              <p class="text-gray-600">No worries, we'll send you reset instructions</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleForgot" class="space-y-6">
              <div>
                <Label for="email" class="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="Enter your registered email"
                  required
                  class="w-full"
                />
              </div>

              <Button
                type="submit"
                class="w-full bg-orange-600 hover:bg-orange-700 py-3 text-lg"
                :disabled="isLoading || !email.trim()"
              >
                <div v-if="isLoading" class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Reset Link...
                </div>
                <div v-else class="flex items-center gap-2">
                  <Mail class="w-4 h-4" />
                  Send Reset Link
                </div>
              </Button>
            </form>

            <!-- Back to Login Link -->
            <div class="mt-6 text-center">
              <p class="text-gray-600">
                Remember your password?
                <router-link to="/login" class="text-blue-600 hover:text-blue-500 font-medium">
                  Back to login
                </router-link>
              </p>
            </div>

            <!-- Additional Help -->
            <div class="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Need help?</h3>
              <p class="text-xs text-gray-600">
                If you don't receive an email within a few minutes, check your spam folder or contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Label from '../components/ui/Label.vue'
import { API_BASE_URL } from '@/config'
import { Key, Mail, CheckCircle, ArrowLeft } from 'lucide-vue-next'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const email = ref('')
const isLoading = ref(false)
const emailSent = ref(false)

const resetForm = () => {
  emailSent.value = false
  email.value = ''
  isLoading.value = false
}

const handleForgot = async () => {
  if (!email.value.trim()) {
    toast.error('Please enter your email address')
    return
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    toast.error('Please enter a valid email address')
    return
  }

  isLoading.value = true

  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send reset email')
    }

    emailSent.value = true
    toast.success('Password reset email sent successfully!')

  } catch (err: any) {
    console.error('Forgot password error:', err)
    toast.error(err.message || 'Failed to send reset email. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>
