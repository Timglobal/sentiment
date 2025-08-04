<template>
  <DashboardLayout>
    <div class="max-w-2xl mx-auto">
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Upload Moment</h2>
          <p class="text-gray-600">Share a special moment or achievement with your team</p>
        </div>
        <Card>
          <CardContent class="p-6">
            <form class="space-y-4" @submit.prevent="submitForm">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Moment Title</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Give your moment a title..."
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Select Workers</label>
                <SelectWorker
                  :selected-worker="selectedWorker"
                  @worker-select="setSelectedWorker"
                  trigger-label="Search and Select Worker"
                  placeholder="Search and select a worker"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Upload Image/Video</label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p class="text-sm text-gray-600">Click to upload or drag and drop</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  v-model="form.tags"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add tags (e.g., achievement, teamwork, milestone)"
                />
              </div>
              <Button class="w-full bg-blue-600 hover:bg-blue-700">Share Moment</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import SelectWorker from '@/components/SelectWorker.vue'
import { Upload } from 'lucide-vue-next'
import type { Worker } from '@/components/SelectWorker.vue'

const selectedWorker = ref<Worker | null>(null)
const form = ref({
  title: '',
  tags: ''
})

const setSelectedWorker = (worker: Worker | null) => {
  selectedWorker.value = worker
}

const submitForm = () => {
  console.log('Form submitted:', {
    ...form.value,
    selectedWorker: selectedWorker.value
  })
  // Handle form submission here
}
</script>
