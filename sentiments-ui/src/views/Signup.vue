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
          <!-- Signup Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus class="w-8 h-8 text-blue-600" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p class="text-gray-600">Join our healthcare platform</p>
          </div>

          <!-- Role Selection -->
          <div class="mb-6">
            <Label class="text-sm font-medium text-gray-700 mb-3 block">Account Type *</Label>
            <div class="grid grid-cols-3 gap-2">

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
            </div>
          </div>

          <!-- Signup Form -->
          <form @submit.prevent="handleSignup" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="firstName" class="text-sm font-medium text-gray-700 mb-2 block">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  v-model="firstName"
                  type="text"
                  placeholder="John"
                  required
                  class="w-full"
                />
              </div>
              <div>
                <Label for="lastName" class="text-sm font-medium text-gray-700 mb-2 block">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  v-model="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  class="w-full"
                />
              </div>
            </div>

            <div>
              <Label for="email" class="text-sm font-medium text-gray-700 mb-2 block">
                Email Address *
              </Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="john@example.com"
                required
                class="w-full"
              />
            </div>

            <!-- Company Fields for Admin -->
            <div v-if="selectedRole === 'admin'" class="space-y-4">
              <div>
                <Label for="companyName" class="text-sm font-medium text-gray-700 mb-2 block">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  v-model="companyName"
                  type="text"
                  placeholder="Healthcare Corp"
                  required
                  class="w-full"
                />
              </div>
              <div>
                <Label for="companyAddress" class="text-sm font-medium text-gray-700 mb-2 block">
                  Company Address *
                </Label>
                <Input
                  id="companyAddress"
                  v-model="companyAddress"
                  type="text"
                  placeholder="123 Healthcare St, Medical City, MC 12345"
                  required
                  class="w-full"
                />
              </div>
            </div>

            <!-- Company ID for Staff and Patient -->
            <div v-if="selectedRole === 'staff' || selectedRole === 'patient'">
              <Label for="companyId" class="text-sm font-medium text-gray-700 mb-2 block">
                Company ID *
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

            <div>
              <Label for="password" class="text-sm font-medium text-gray-700 mb-2 block">
                Password *
              </Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a strong password"
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
              <Label for="confirmPassword" class="text-sm font-medium text-gray-700 mb-2 block">
                Confirm Password *
              </Label>
              <div class="relative">
                <Input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  required
                  class="w-full pr-10"
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
            </div>

            <!-- Profile Picture Upload -->
            <div>
              <Label class="text-sm font-medium text-gray-700 mb-2 block">
                Profile Picture (Optional)
              </Label>
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 rounded-full border-2 border-gray-300 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    alt="Avatar preview"
                    class="w-full h-full object-cover"
                  />
                  <Camera v-else class="w-6 h-6 text-gray-400" />
                </div>
                <div class="flex-1">
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    @change="handleAvatar"
                    class="hidden"
                  />
                  <label
                    for="avatar"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Camera class="w-4 h-4 mr-2" />
                    Choose Photo
                  </label>
                  <p class="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
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
                  <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a>
                  and
                  <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  *
                </label>
              </div>
            </div>

            <Button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              :disabled="isLoading || !acceptTerms || password !== confirmPassword"
            >
              <div v-if="isLoading" class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </div>
              <div v-else class="flex items-center gap-2">
                <UserPlus class="w-4 h-4" />
                Create Account
              </div>
            </Button>
          </form>

          <!-- Login Link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Already have an account?
              <router-link to="/login" class="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
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
import { Menu, X, UserPlus, User, Shield, Eye, EyeOff, Camera, Heart } from 'lucide-vue-next'
import { useToast } from 'vue-toast-notification'
const toast = useToast()

const router = useRouter()
const avatarUrl = ref<string | null>(null)
const selectedRole = ref('admin')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const companyName = ref('')
const companyAddress = ref('')
const companyId = ref('')
const acceptTerms = ref(false)
const isLoading = ref(false)

function handleAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    avatarUrl.value = URL.createObjectURL(file)
  }
}

const handleSignup = async () => {
  // Basic field validation
  if (!firstName.value.trim()) {
    toast.error('First name is required')
    return
  }

  if (!lastName.value.trim()) {
    toast.error('Last name is required')
    return
  }

  if (!email.value.trim()) {
    toast.error('Email address is required')
    return
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    toast.error('Please enter a valid email address')
    return
  }

  if (!password.value) {
    toast.error('Password is required')
    return
  }

  if (password.value.length < 6) {
    toast.error('Password must be at least 6 characters long')
    return
  }

  if (!confirmPassword.value) {
    toast.error('Please confirm your password')
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error('Passwords do not match')
    return
  }

  // Role-specific field validation
  if (selectedRole.value === 'admin') {
    if (!companyName.value.trim()) {
      toast.error('Company name is required for administrators')
      return
    }
    if (!companyAddress.value.trim()) {
      toast.error('Company address is required for administrators')
      return
    }
  } else if (selectedRole.value === 'staff' || selectedRole.value === 'patient') {
    if (!companyId.value.trim()) {
      toast.error('Company ID is required')
      return
    }
  }

  if (!acceptTerms.value) {
    toast.error('You must accept the terms and conditions')
    return
  }

  isLoading.value = true
  try {
    const formData = new FormData()
    formData.append('name', `${firstName.value.trim()} ${lastName.value.trim()}`)
    formData.append('email', email.value.trim())
    formData.append('password', password.value)
    formData.append('role', selectedRole.value)

    // Add role-specific fields
    if (selectedRole.value === 'admin') {
      formData.append('companyName', companyName.value.trim())
      formData.append('companyAddress', companyAddress.value.trim())
    } else if (selectedRole.value === 'staff' || selectedRole.value === 'patient') {
      formData.append('companyId', companyId.value.trim())
    }

    if ((document.getElementById('avatar') as HTMLInputElement).files?.[0]) {
      formData.append('avatar', (document.getElementById('avatar') as HTMLInputElement).files![0])
    }

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success('Registration successful, Your Comapany ID has been sent to your email!')
    router.push('/login')
  } catch (err: any) {
    toast.error('Signup failed: ' + err.message)
  }

  isLoading.value = false
}

</script>
