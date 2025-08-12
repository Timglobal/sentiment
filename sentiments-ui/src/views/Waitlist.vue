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
          <!-- Waitlist Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList class="w-8 h-8 text-blue-600" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Join the Waitlist</h2>
            <p class="text-gray-600">Be the first to know when we launch</p>
          </div>

          <!-- Waitlist Form -->
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <Label for="name" class="text-sm font-medium text-gray-700 mb-2 block">
                Full Name
              </Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Your full name"
                required
                class="w-full"
              />
            </div>

            <div>
              <Label for="email" class="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Email address"
                required
                class="w-full"
              />
            </div>

            <div>
              <Label for="company" class="text-sm font-medium text-gray-700 mb-2 block">
                Company (optional)
              </Label>
              <Input
                id="company"
                v-model="form.company"
                type="text"
                placeholder="Your company name"
                class="w-full"
              />
            </div>

            <div>
              <Label for="purpose" class="text-sm font-medium text-gray-700 mb-2 block">
                Why are you interested?
              </Label>
              <Input
                id="purpose"
                v-model="form.purpose"
                type="text"
                placeholder="Tell us why you're interested"
                class="w-full"
              />
            </div>

            <div>
              <Label for="feedback" class="text-sm font-medium text-gray-700 mb-2 block">
                Additional Feedback (optional)
              </Label>
              <textarea
                id="feedback"
                v-model="form.feedback"
                rows="4"
                placeholder="Any extra thoughts?"
                class="w-full p-3 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            <Button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              :disabled="isLoading"
            >
              <div v-if="isLoading" class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
              <div v-else class="flex items-center gap-2">
                <ClipboardList class="w-4 h-4" />
                Save
              </div>
            </Button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toast-notification'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Label from '../components/ui/Label.vue'
import { ClipboardList } from 'lucide-vue-next'

const toast = useToast()
const route = useRoute()

const form = ref({
  name: '',
  email: '',
  company: '',
  purpose: '',
  feedback: ''
})

const isLoading = ref(false)

onMounted(() => {
  const emailFromQuery = route.query.email as string
  if (emailFromQuery) form.value.email = emailFromQuery
})

async function submitForm() {
  isLoading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success('You’ve been added to the waitlist! ✅')
    form.value = { name: '', email: '', company: '', purpose: '', feedback: '' }
  } catch (err: any) {
    toast.error(err.message || 'Something went wrong.')
  }
  isLoading.value = false
}
</script>
