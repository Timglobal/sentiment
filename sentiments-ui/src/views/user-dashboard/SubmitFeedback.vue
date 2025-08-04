<template>
  <UserDashboardLayout>
    <div v-if="submitted" class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Submit Feedback</h1>
          <p class="text-gray-600">Share your thoughts and experiences</p>
        </div>
      </div>

      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border">
        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Feedback Submitted Successfully!</h2>
          <p class="text-gray-600 mb-4">
            Thank you for taking the time to share your feedback. Your input is valuable and helps us improve.
          </p>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>What happens next?</strong> Your feedback will be reviewed by our team and appropriate actions will be taken. 
              You may receive follow-up communication if needed.
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
          <p class="text-gray-600">Share your thoughts and experiences to help us improve</p>
        </div>
        <div class="px-3 py-1 border border-gray-300 rounded-lg flex items-center gap-2 text-sm text-gray-600">
          <Clock class="w-4 h-4" />
          Takes 2-3 minutes
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
                <p class="text-sm text-gray-600">Total Submissions</p>
                <p class="text-lg font-semibold">2,847</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-green-100 rounded-lg">
                <Star class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Avg Satisfaction</p>
                <p class="text-lg font-semibold">4.2/5</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle class="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Response Time</p>
                <p class="text-lg font-semibold">2.1 hrs</p>
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
            Share Your Feedback
          </h2>
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
import { ref } from 'vue'
import UserDashboardLayout from '../../components/UserDashboardLayout.vue'
import SelectWorker from '../../components/SelectWorker.vue'
import { 
  MessageSquare,
  Send,
  CheckCircle,
  Building,
  Users,
  Star,
  AlertCircle,
  Clock
} from 'lucide-vue-next'

interface Worker {
  id: number
  name: string
  role: string
  department: string
}

const feedback = ref("")
const category = ref("")
const selectedWorker = ref<Worker | null>(null)
const isSubmitting = ref(false)
const submitted = ref(false)

// Mock data
const categories = [
  { value: "work-environment", label: "Work Environment", icon: Building },
  { value: "team-collaboration", label: "Team Collaboration", icon: Users },
  { value: "management", label: "Management", icon: Users },
  { value: "resources", label: "Resources & Tools", icon: Building },
  { value: "other", label: "Other", icon: MessageSquare }
]

const handleSubmit = async () => {
  if (!feedback.value.trim() || !category.value) {
    return
  }

  isSubmitting.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  isSubmitting.value = false
  submitted.value = true
  
  // Reset form after success message
  setTimeout(() => {
    submitted.value = false
    feedback.value = ""
    category.value = ""
    selectedWorker.value = null
  }, 3000)
}

const clearForm = () => {
  feedback.value = ""
  category.value = ""
  selectedWorker.value = null
}
</script>
