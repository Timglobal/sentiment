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
          <div v-if="resetSuccessful" class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p class="text-gray-600 mb-6">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <Button
              @click="$router.push('/login')"
              class="w-full bg-green-600 hover:bg-green-700 py-3 text-lg"
            >
              <LogIn class="w-4 h-4 mr-2" />
              Continue to Login
            </Button>
          </div>

          <!-- Error State -->
          <div v-else-if="hasError" class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle class="w-8 h-8 text-red-600" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Reset Link Invalid</h2>
            <p class="text-gray-600 mb-6">
              {{ errorMessage }}
            </p>
            <div class="space-y-3">
              <Button
                @click="$router.push('/forgot-password')"
                class="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              >
                <Mail class="w-4 h-4 mr-2" />
                Request New Reset Link
              </Button>
              <Button
                @click="$router.push('/login')"
                variant="outline"
                class="w-full py-3 text-lg"
              >
                Back to Login
              </Button>
            </div>
          </div>

          <!-- Reset Password Form -->
          <div v-else>
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock class="w-8 h-8 text-purple-600" />
              </div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
              <p class="text-gray-600">Create a new secure password for your account</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleReset" class="space-y-6">
              <div>
                <Label for="password" class="text-sm font-medium text-gray-700 mb-2 block">
                  New Password *
                </Label>
                <div class="relative">
                  <Input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Enter your new password"
                    required
                    class="w-full pr-10"
                    minlength="6"
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
                <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <Label for="confirmPassword" class="text-sm font-medium text-gray-700 mb-2 block">
                  Confirm New Password *
                </Label>
                <div class="relative">
                  <Input
                    id="confirmPassword"
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Confirm your new password"
                    required
                    class="w-full pr-10"
                    minlength="6"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <EyeOff v-if="showConfirmPassword" class="h-4 w-4 text-gray-400" />
                    <Eye v-else class="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <p v-if="password && confirmPassword && password !== confirmPassword" class="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              </div>

              <!-- Password Requirements -->
              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                <ul class="text-xs text-blue-800 space-y-1">
                  <li class="flex items-center gap-2">
                    <CheckCircle v-if="password.length >= 6" class="w-3 h-3 text-green-600" />
                    <Circle v-else class="w-3 h-3 text-gray-400" />
                    At least 6 characters long
                  </li>
                  <li class="flex items-center gap-2">
                    <CheckCircle v-if="/[A-Z]/.test(password)" class="w-3 h-3 text-green-600" />
                    <Circle v-else class="w-3 h-3 text-gray-400" />
                    Contains uppercase letter (recommended)
                  </li>
                  <li class="flex items-center gap-2">
                    <CheckCircle v-if="/[0-9]/.test(password)" class="w-3 h-3 text-green-600" />
                    <Circle v-else class="w-3 h-3 text-gray-400" />
                    Contains number (recommended)
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                class="w-full bg-purple-600 hover:bg-purple-700 py-3 text-lg"
                :disabled="isLoading || !password || !confirmPassword || password !== confirmPassword || password.length < 6"
              >
                <div v-if="isLoading" class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting Password...
                </div>
                <div v-else class="flex items-center gap-2">
                  <Lock class="w-4 h-4" />
                  Reset Password
                </div>
              </Button>
            </form>

            <!-- Help Text -->
            <div class="mt-6 text-center">
              <p class="text-gray-600 text-sm">
                <router-link to="/login" class="text-blue-600 hover:text-blue-500 font-medium">
                  Back to login
                </router-link>
              </p>
            </div>

            <!-- Security Notice -->
            <div class="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-900 mb-2">🔒 Security Notice</h3>
              <p class="text-xs text-gray-600">
                Choose a strong, unique password that you haven't used elsewhere.
                After resetting, you'll be automatically logged out from all devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Label from '../components/ui/Label.vue'
import { API_BASE_URL } from '@/config'
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, LogIn, Mail, Circle } from 'lucide-vue-next'
import { useToast } from 'vue-toast-notification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const email = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const resetSuccessful = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

onMounted(() => {
  email.value = route.query.email as string || ''
  token.value = route.query.token as string || ''

  // Validate that we have the required parameters
  if (!email.value || !token.value) {
    hasError.value = true
    errorMessage.value = 'Missing reset parameters. The reset link appears to be incomplete or invalid.'
  }
})

const handleReset = async () => {
  // Client-side validation
  if (!password.value || !confirmPassword.value) {
    toast.error('Please fill in all password fields')
    return
  }

  if (password.value.length < 6) {
    toast.error('Password must be at least 6 characters long')
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error('Passwords do not match')
    return
  }

  if (!email.value || !token.value) {
    toast.error('Invalid reset link. Please request a new password reset.')
    return
  }

  isLoading.value = true

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

    if (!res.ok) {
      throw new Error(data.message || 'Failed to reset password')
    }

    resetSuccessful.value = true
    toast.success('Password reset successful!')

  } catch (err: any) {
    console.error('Reset password error:', err)

    // Handle specific error cases
    if (err.message.includes('expired')) {
      hasError.value = true
      errorMessage.value = 'This reset link has expired. Reset links are valid for 15 minutes only.'
    } else if (err.message.includes('Invalid')) {
      hasError.value = true
      errorMessage.value = 'This reset link is invalid or has already been used.'
    } else {
      toast.error(err.message || 'Failed to reset password. Please try again.')
    }
  } finally {
    isLoading.value = false
  }
}
</script>
