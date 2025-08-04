<template>
  <DashboardLayout>
    <div class="max-w-2xl mx-auto">
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Submit Feedback</h2>
          <p class="text-gray-600">Share your thoughts and feedback with the team</p>
        </div>
        <Card>
          <CardContent class="p-6">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </Label>
                  <input
                    id="name"
                    v-model="name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <Label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    Your Email
                  </Label>
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label for="source" class="block text-sm font-medium text-gray-700 mb-2">
                  Your Role/Source
                </Label>
                <select
                  id="source"
                  v-model="source"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="patient">Patient</option>
                  <option value="staff">Staff Member</option>
                  <option value="colleague">Colleague</option>
                  <option value="family">Family Member</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>

              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Staff
                </Label>
                <SelectWorker
                  :selected-worker="selectedWorker"
                  @worker-select="selectedWorker = $event"
                  trigger-label="Select Staff for Feedback"
                  placeholder="Choose a specific staff member"
                />
              </div>

              <div>
                <Label for="feedback" class="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback
                </Label>
                <Textarea
                  id="feedback"
                  v-model="feedback"
                  :rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your feedback here... Be specific about your experience with this staff member."
                  required
                />
              </div>

              <!-- Error Message -->
              <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600">{{ error }}</p>
              </div>

              <Button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700"
                :disabled="isSubmitting || !isFormValid"
              >
                <div v-if="isSubmitting" class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
                <span v-else>Submit Feedback</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <!-- Success Message -->
        <div
          v-if="submitted"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          @click="submitted = false"
        >
          <Card class="max-w-md mx-4">
            <CardContent class="p-6 text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle class="w-8 h-8 text-green-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Feedback Submitted!</h3>
              <p class="text-gray-600">Thank you for your feedback. It has been submitted successfully.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import Card from '../../components/ui/Card.vue'
import CardContent from '../../components/ui/CardContent.vue'
import Button from '../../components/ui/Button.vue'
import Label from '../../components/ui/Label.vue'
import Textarea from '../../components/ui/Textarea.vue'
import SelectWorker from '../../components/SelectWorker.vue'
import { CheckCircle } from 'lucide-vue-next'
import type { Worker } from '@/services/workerService'
import { useFeedback } from '@/composables/useFeedback'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { submitFeedback, isSubmitting, error, clearError } = useFeedback()

const selectedWorker = ref<Worker | null>(null)
const name = ref('')
const email = ref('')
const feedback = ref('')
const source = ref('')
const submitted = ref(false)

// Auto-fill user data if authenticated
if (authStore.user) {
  name.value = authStore.user.name || ''
  email.value = authStore.user.email || ''
  source.value = authStore.user.role || 'patient'
}

const isFormValid = computed(() => {
  return name.value.trim() &&
         email.value.trim() &&
         feedback.value.trim() &&
         selectedWorker.value &&
         source.value.trim()
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  clearError()

  const feedbackData = {
    name: name.value.trim(),
    email: email.value.trim(),
    message: feedback.value.trim(),
    workerId: selectedWorker.value!._id,
    source: source.value.trim()
  }

  const success = await submitFeedback(feedbackData)

  if (success) {
    submitted.value = true

    // Reset form after success
    setTimeout(() => {
      submitted.value = false
      feedback.value = ''
      selectedWorker.value = null
      // Keep name, email, and source filled for convenience
    }, 3000)
  }
}
</script>
