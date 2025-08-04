<template>
  <DashboardLayout>
    <div class="max-w-2xl mx-auto">
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Upload Moment</h2>
          <p class="text-gray-600">Share a special moment or achievement with your team. Our AI will analyze the content automatically!</p>
        </div>
        <Card>
          <CardContent class="p-6">
            <form class="space-y-4" @submit.prevent="submitForm">
              <div>
                <Label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Worker *
                </Label>
                <SelectWorker
                  :selected-worker="selectedWorker"
                  @worker-select="setSelectedWorker"
                  trigger-label="Search and Select Worker"
                  placeholder="Search and select a worker"
                />
              </div>

              <div>
                <Label for="media" class="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image/Video *
                </Label>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div class="flex items-start gap-2">
                    <div class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-white text-xs font-bold">i</span>
                    </div>
                    <div class="text-sm text-blue-700">
                      <p class="font-medium">AI-Powered Analysis</p>
                      <p>Our system will automatically analyze your media to extract meaningful content and determine sentiment scores. No description needed!</p>
                    </div>
                  </div>
                </div>
                <div
                  :class="[
                    'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                    isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
                    selectedFile ? 'border-green-500 bg-green-50' : ''
                  ]"
                  @dragover.prevent="isDragOver = true"
                  @dragleave.prevent="isDragOver = false"
                  @drop.prevent="handleFileDrop"
                  @click="triggerFileInput"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*,video/*"
                    class="hidden"
                    @change="handleFileSelect"
                  />

                  <div v-if="!selectedFile">
                    <Upload class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p class="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p class="text-xs text-gray-500 mt-1">
                      Supports: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, WebM, MOV, AVI)
                    </p>
                    <p class="text-xs text-gray-500">Max size: 50MB</p>
                  </div>

                  <div v-else class="space-y-2">
                    <div class="flex items-center justify-center gap-2">
                      <component :is="getFileIcon(selectedFile)" class="w-6 h-6 text-green-600" />
                      <span class="font-medium text-green-700">{{ selectedFile.name }}</span>
                    </div>
                    <p class="text-sm text-gray-600">{{ formatFileSize(selectedFile.size) }}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      @click.stop="clearFile"
                      class="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Error Display -->
              <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600">{{ error }}</p>
              </div>

              <!-- Success Message -->
              <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-start gap-2">
                  <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-white text-xs">✓</span>
                  </div>
                  <div class="text-sm text-green-700">
                    <p class="font-medium">Upload Successful!</p>
                    <p>{{ successMessage }}</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700"
                :disabled="isSubmitting || !isFormValid"
              >
                <div v-if="isSubmitting" class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading Moment...
                </div>
                <span v-else>Share Moment</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import Textarea from '@/components/ui/Textarea.vue'
import SelectWorker from '@/components/SelectWorker.vue'
import { Upload, Image, Video, FileText } from 'lucide-vue-next'
import type { Worker } from '@/services/workerService'
import { useMoments } from '@/composables/useMoments'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { createMoment, isSubmitting, error, clearError, getFileType, validateFile } = useMoments()

// Form state
const selectedWorker = ref<Worker | null>(null)
const selectedFile = ref<File | null>(null)
const form = ref({
  description: ''
})

// UI state
const isDragOver = ref(false)
const successMessage = ref('')
const fileInput = ref<HTMLInputElement>()

// Computed
const isFormValid = computed(() => {
  return form.value.description.trim() &&
         selectedWorker.value &&
         selectedFile.value
})

// File handling methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    handleFile(target.files[0])
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    handleFile(event.dataTransfer.files[0])
  }
}

const handleFile = (file: File) => {
  clearError()

  const validationError = validateFile(file)
  if (validationError) {
    // Show error through the error system
    return
  }

  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const setSelectedWorker = (worker: Worker | null) => {
  selectedWorker.value = worker
}

// Utility functions
const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return Image
  if (file.type.startsWith('video/')) return Video
  return FileText
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Form submission
const submitForm = async () => {
  if (!isFormValid.value || !selectedFile.value || !selectedWorker.value) return

  clearError()
  successMessage.value = ''

  const momentData = {
    workerId: selectedWorker.value._id,
    description: form.value.description.trim(),
    mediaType: getFileType(selectedFile.value),
    submittedBy: authStore.user?.name || authStore.user?.email || 'Unknown User',
    media: selectedFile.value
  }

  const success = await createMoment(momentData)

  if (success) {
    successMessage.value = 'Moment uploaded successfully! Sentiment analysis has been applied.'

    // Reset form after success
    setTimeout(() => {
      form.value.description = ''
      selectedWorker.value = null
      selectedFile.value = null
      successMessage.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }, 3000)
  }
}
</script>
