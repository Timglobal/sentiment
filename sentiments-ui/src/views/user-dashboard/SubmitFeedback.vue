<template>
  <UserDashboardLayout>
    <div v-if="submitted" class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Submit Feedback</h1>
          <p class="text-gray-600">
            {{ auth.user?.role === 'staff'
              ? 'Share feedback about patients, colleagues, or processes'
              : 'Share your healthcare experience'
            }}
          </p>
        </div>
        <Badge :class="auth.user?.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
          {{ auth.user?.role === 'staff' ? 'Staff Member' : 'Patient' }}
        </Badge>
      </div>

      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border">
        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Feedback Submitted Successfully!</h2>
          <p class="text-gray-600 mb-4">
            Thank you for taking the time to share your feedback. Your input is valuable and helps us improve
            {{ auth.user?.role === 'staff' ? 'our healthcare processes and team collaboration' : 'your healthcare experience' }}.
          </p>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>What happens next?</strong> Your feedback will be reviewed by
              {{ auth.user?.role === 'staff' ? 'the management team' : 'your healthcare team' }}
              and appropriate actions will be taken. You may receive follow-up communication if needed.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Submit Feedback</h1>
          <p class="text-gray-600">
            {{ auth.user?.role === 'staff'
              ? 'Share feedback about patients, colleagues, or healthcare processes'
              : 'Share your healthcare experience to help us improve'
            }}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <Badge :class="auth.user?.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
            {{ auth.user?.role === 'staff' ? 'Staff Member' : 'Patient' }}
          </Badge>
          <div class="px-3 py-1 border border-gray-300 rounded-lg flex items-center gap-2 text-sm text-gray-600">
            <Clock class="w-4 h-4" />
            Takes 2-3 minutes
          </div>
        </div>
      </div>

      <!-- Feedback Form -->
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <MessageSquare class="w-5 h-5" />
            Share Your Feedback
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Your feedback helps us improve our healthcare services and team performance.
          </p>
        </div>
        <div class="p-6 space-y-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Select Worker -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">Select Person for Feedback *</label>
              <SelectWorker
                :selected-worker="selectedWorker"
                @worker-select="selectedWorker = $event"
                trigger-label="Select Person for Feedback"
                placeholder="Choose a person to provide feedback about (Required)"
                required
              />
              <p class="text-xs text-gray-500">
                Please select the specific person you want to provide feedback about.
              </p>
            </div>

            <!-- Feedback Text -->
            <div class="space-y-3">
              <label for="feedback" class="block text-sm font-medium text-gray-700">
                Your Feedback *
              </label>
              <textarea
                id="feedback"
                v-model="feedback"
                placeholder="Please share your detailed feedback, suggestions, or concerns. Be as specific as possible to help us understand and address your input effectively."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                maxlength="1000"
                required
              ></textarea>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>Be specific and constructive in your feedback</span>
                <span>{{ feedback.length }}/1000 characters</span>
              </div>
            </div>

            <!-- Privacy Notice -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="flex gap-3">
                <CheckCircle class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div class="text-sm text-blue-800">
                  <p class="font-medium mb-1">Privacy & Confidentiality</p>
                  <p>
                    Your feedback is treated confidentially and will only be shared with relevant team members
                    for improvement purposes. We respect your privacy and handle all feedback responsibly.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="clearForm"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                :disabled="!isFormValid || isSubmitting"
                class="min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div v-if="isSubmitting" class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
                <div v-else class="flex items-center gap-2">
                  <Send class="w-4 h-4" />
                  Submit Feedback
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </UserDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useAuthStore } from '@/stores/auth'
import { useFeedback } from '@/composables/useFeedback'
import UserDashboardLayout from '../../components/UserDashboardLayout.vue'
import SelectWorker from '../../components/SelectWorker.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Worker } from '@/services/workerService'
import {
  MessageSquare,
  Send,
  CheckCircle,
  Clock
} from 'lucide-vue-next'

// State
const toast = useToast()
const auth = useAuthStore()
const { submitFeedback, isSubmitting, error, clearError } = useFeedback()
const feedback = ref("")
const selectedWorker = ref<Worker | null>(null)
const submitted = ref(false)

// Auto-fill user data from authenticated user
const name = ref(auth.user?.name || '')
const email = ref(auth.user?.email || '')
const source = ref(auth.user?.role || 'patient')

// Computed
const isFormValid = computed(() => {
  return name.value.trim() &&
         email.value.trim() &&
         feedback.value.trim() &&
         selectedWorker.value &&
         source.value.trim()
})

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error('Please fill in all required fields including worker selection')
    return
  }

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
      clearForm()
    }, 3000)
  }
}

const clearForm = () => {
  feedback.value = ""
  selectedWorker.value = null
  // Keep name, email, and source filled for convenience since they're from authenticated user
}
</script>
