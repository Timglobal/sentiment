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
              <div>
                <Label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Category
                </Label>
                <select
                  id="category"
                  v-model="category"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  <option>Team Collaboration</option>
                  <option>Work Environment</option>
                  <option>Management</option>
                  <option>Resources</option>
                </select>
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
                  placeholder="Share your feedback here..."
                  required
                />
              </div>
              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Worker (Optional)
                </Label>
                <SelectWorker
                  :selected-worker="selectedWorker"
                  @worker-select="selectedWorker = $event"
                  trigger-label="Select Worker for Feedback"
                  placeholder="Choose a specific worker (optional)"
                />
              </div>
              <Button 
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700"
                :disabled="isLoading"
              >
                <div v-if="isLoading" class="flex items-center gap-2">
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
import { ref } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import Card from '../../components/ui/Card.vue'
import CardContent from '../../components/ui/CardContent.vue'
import Button from '../../components/ui/Button.vue'
import Label from '../../components/ui/Label.vue'
import Textarea from '../../components/ui/Textarea.vue'
import SelectWorker from '../../components/SelectWorker.vue'
import { CheckCircle } from 'lucide-vue-next'
import type { Worker } from '../../components/SelectWorker.vue'

const selectedWorker = ref<Worker | null>(null)
const category = ref('')
const feedback = ref('')
const isLoading = ref(false)
const submitted = ref(false)

const handleSubmit = async () => {
  if (!category.value || !feedback.value) return
  
  isLoading.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  isLoading.value = false
  submitted.value = true
  
  // Reset form after success
  setTimeout(() => {
    submitted.value = false
    category.value = ''
    feedback.value = ''
    selectedWorker.value = null
  }, 3000)
}
</script>
