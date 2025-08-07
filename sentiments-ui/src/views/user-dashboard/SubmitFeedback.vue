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

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <MessageSquare class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">
                  {{ auth.user?.role === 'staff' ? 'Your Submissions' : 'Your Feedback' }}
                </p>
                <p class="text-lg font-semibold">{{ auth.user?.role === 'staff' ? '24' : '8' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-green-100 rounded-lg">
                <ThumbsUp class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">
                  {{ auth.user?.role === 'staff' ? 'Positive Reviews' : 'Response Rate' }}
                </p>
                <p class="text-lg font-semibold">{{ auth.user?.role === 'staff' ? '92%' : '100%' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <Users class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">
                  {{ auth.user?.role === 'staff' ? 'Team Impact' : 'Care Team Size' }}
                </p>
                <p class="text-lg font-semibold">{{ auth.user?.role === 'staff' ? 'High' : '5' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role-based Feedback Categories -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            {{ auth.user?.role === 'staff' ? 'Feedback Categories' : 'Share Your Experience' }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="auth.user?.role === 'staff'" class="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                 @click="selectFeedbackType('patient')">
              <div class="flex items-start space-x-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <User class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Patient Feedback</h3>
                  <p class="text-sm text-gray-600">Share observations about patient care, progress, or concerns</p>
                </div>
              </div>
            </div>

            <div v-if="auth.user?.role === 'staff'" class="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                 @click="selectFeedbackType('colleague')">
              <div class="flex items-start space-x-3">
                <div class="p-2 bg-green-100 rounded-lg">
                  <Users class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Colleague Feedback</h3>
                  <p class="text-sm text-gray-600">Provide feedback about team members, collaboration, or performance</p>
                </div>
              </div>
            </div>

            <div v-if="auth.user?.role === 'staff'" class="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer"
                 @click="selectFeedbackType('process')">
              <div class="flex items-start space-x-3">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <Settings class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Process Improvement</h3>
                  <p class="text-sm text-gray-600">Suggest improvements to workflows, procedures, or systems</p>
                </div>
              </div>
            </div>

            <div v-if="auth.user?.role !== 'staff'" class="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                 @click="selectFeedbackType('staff')">
              <div class="flex items-start space-x-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Healthcare Team</h3>
                  <p class="text-sm text-gray-600">Share feedback about your assigned healthcare providers</p>
                </div>
              </div>
            </div>

            <div v-if="auth.user?.role !== 'staff'" class="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                 @click="selectFeedbackType('care')">
              <div class="flex items-start space-x-3">
                <div class="p-2 bg-green-100 rounded-lg">
                  <Heart class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">Care Experience</h3>
                  <p class="text-sm text-gray-600">Rate and comment on your overall care experience</p>
                </div>
              </div>
            </div>

            <div class="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer"
                 @click="selectFeedbackType('general')">
              <div class="flex items-start space-x-3">
                <div class="p-2 bg-orange-100 rounded-lg">
                  <MessageCircle class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">General Feedback</h3>
                  <p class="text-sm text-gray-600">
                    {{ auth.user?.role === 'staff'
                      ? 'Other suggestions, concerns, or compliments'
                      : 'General suggestions or concerns about your care'
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Form -->
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <MessageSquare class="w-5 h-5" />
            Share Your {{ feedbackType ? feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1) : '' }} Feedback
          </h2>
          <p class="text-sm text-gray-600 mt-1" v-if="feedbackType">
            {{ getFeedbackTypeDescription(feedbackType) }}
          </p>
        </div>
        <div class="p-6 space-y-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Category Selection -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">What would you like to provide feedback about? *</label>
              <select
                v-model="category"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <!-- Select Worker (Optional) -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">Select Worker for Feedback (Optional)</label>
              <SelectWorker
                :selected-worker="selectedWorker"
                @worker-select="selectedWorker = $event"
                trigger-label="Select Worker for Feedback"
                placeholder="Choose a worker to provide feedback about (optional)"
              />
              <p class="text-xs text-gray-500">
                You can provide feedback about a specific worker or leave this blank for general feedback.
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
                :disabled="!feedback.trim() || !category || isSubmitting"
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

      <!-- Guidelines -->
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold">Feedback Guidelines</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-green-600 mb-2">✓ Do</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Be specific and provide concrete examples</li>
                <li>• Focus on behaviors and situations, not personalities</li>
                <li>• Suggest constructive solutions when possible</li>
                <li>• Keep feedback relevant to work environment</li>
              </ul>
            </div>
            <div>
              <h4 class="font-medium text-red-600 mb-2">✗ Don't</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Use offensive or inappropriate language</li>
                <li>• Make personal attacks or accusations</li>
                <li>• Share confidential or sensitive information</li>
                <li>• Submit false or misleading information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UserDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useAuthStore } from '@/stores/auth'
import UserDashboardLayout from '../../components/UserDashboardLayout.vue'
import SelectWorker from '../../components/SelectWorker.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Worker } from '@/services/workerService'
import {
  MessageSquare,
  Send,
  CheckCircle,
  Building,
  Users,
  Star,
  AlertCircle,
  Clock,
  ThumbsUp,
  User,
  Settings,
  Stethoscope,
  Heart,
  MessageCircle
} from 'lucide-vue-next'

// State
const toast = useToast()
const auth = useAuthStore()
const feedback = ref("")
const category = ref("")
const selectedWorker = ref<Worker | null>(null)
const isSubmitting = ref(false)
const submitted = ref(false)
const feedbackType = ref<string>('')

// Role-based categories
const staffCategories = [
  { value: "patient-care", label: "Patient Care Quality", icon: User },
  { value: "colleague-performance", label: "Colleague Performance", icon: Users },
  { value: "process-improvement", label: "Process Improvement", icon: Settings },
  { value: "team-collaboration", label: "Team Collaboration", icon: Users },
  { value: "management", label: "Management", icon: Building },
  { value: "resources", label: "Resources & Tools", icon: Building },
  { value: "other", label: "Other", icon: MessageSquare }
]

const patientCategories = [
  { value: "healthcare-team", label: "Healthcare Team", icon: Stethoscope },
  { value: "care-quality", label: "Care Quality", icon: Heart },
  { value: "communication", label: "Communication", icon: MessageCircle },
  { value: "facility", label: "Facility & Environment", icon: Building },
  { value: "other", label: "Other", icon: MessageSquare }
]

const categories = computed(() => {
  return auth.user?.role === 'staff' ? staffCategories : patientCategories
})

// Methods
const selectFeedbackType = (type: string) => {
  feedbackType.value = type
  // Auto-select appropriate category based on feedback type
  if (auth.user?.role === 'staff') {
    switch (type) {
      case 'patient':
        category.value = 'patient-care'
        break
      case 'colleague':
        category.value = 'colleague-performance'
        break
      case 'process':
        category.value = 'process-improvement'
        break
      default:
        category.value = 'other'
    }
  } else {
    switch (type) {
      case 'staff':
        category.value = 'healthcare-team'
        break
      case 'care':
        category.value = 'care-quality'
        break
      default:
        category.value = 'other'
    }
  }
}

const getFeedbackTypeDescription = (type: string) => {
  const descriptions: Record<string, string> = {
    patient: 'Share observations about patient care, progress, or concerns',
    colleague: 'Provide feedback about team members, collaboration, or performance',
    process: 'Suggest improvements to workflows, procedures, or systems',
    staff: 'Share feedback about your assigned healthcare providers',
    care: 'Rate and comment on your overall care experience',
    general: auth.user?.role === 'staff'
      ? 'Other suggestions, concerns, or compliments'
      : 'General suggestions or concerns about your care'
  }
  return descriptions[type] || 'Share your feedback'
}

const handleSubmit = async () => {
  if (!feedback.value.trim() || !category.value) {
    toast.error('Please fill in all required fields')
    return
  }

  isSubmitting.value = true

  try {
    // Simulate API call - replace with actual service call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Here you would call your feedback service
    // await feedbackService.submitFeedback({
    //   feedback: feedback.value,
    //   category: category.value,
    //   workerId: selectedWorker.value?.id,
    //   feedbackType: feedbackType.value,
    //   userId: auth.user?.id,
    //   userRole: auth.user?.role
    // })

    toast.success('Feedback submitted successfully!')
    submitted.value = true

    // Reset form after success message
    setTimeout(() => {
      submitted.value = false
      clearForm()
    }, 3000)
  } catch (error) {
    toast.error('Failed to submit feedback. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const clearForm = () => {
  feedback.value = ""
  category.value = ""
  selectedWorker.value = null
  feedbackType.value = ""
}
</script>
