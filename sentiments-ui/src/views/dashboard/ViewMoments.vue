<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Team Moments</h2>
          <p class="text-gray-600">View and celebrate special moments and achievements</p>
        </div>
        <Button @click="loadMoments()" :disabled="isLoading" class="bg-green-600 hover:bg-green-700">
          <RotateCcw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <!-- Filters -->
      <Card>
        <CardContent class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label class="block text-sm font-medium text-gray-700 mb-2">
                Filter by Worker
              </Label>
              <SelectWorker
                :selected-worker="selectedWorker"
                @worker-select="handleWorkerFilter"
                trigger-label="All Workers"
                placeholder="Select a worker to filter"
              />
            </div>

            <div>
              <Label class="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </Label>
              <select
                v-model="sortBy"
                @change="loadMoments({ sortBy, sortOrder, workerId: selectedWorker?._id })"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="timestamp">Date</option>
                <option value="sentimentScore">Sentiment Score</option>
              </select>
            </div>

            <div>
              <Label class="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </Label>
              <select
                v-model="sortOrder"
                @change="loadMoments({ sortBy, sortOrder, workerId: selectedWorker?._id })"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Moments Grid -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="moments.length === 0" class="text-center py-12">
        <Camera class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No moments found</h3>
        <p class="text-gray-600">Start by uploading your first moment!</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="moment in moments"
          :key="moment._id"
          class="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div class="aspect-video bg-gray-100 relative">
            <img
              v-if="moment.mediaType === 'image'"
              :src="moment.mediaUrl"
              :alt="moment.extractedText"
              class="w-full h-full object-cover"
            />
            <video
              v-else
              :src="moment.mediaUrl"
              class="w-full h-full object-cover"
              controls
              preload="metadata"
            />

            <!-- Sentiment Badge -->
            <div
              v-if="moment.sentimentScore !== null && moment.sentimentScore !== undefined"
              :class="[
                'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium',
                getSentimentBadgeClass(moment.sentimentScore)
              ]"
            >
              {{ moment.sentimentScore }}%
            </div>

            <!-- Processing Status Badge for videos without sentiment -->
            <div
              v-else-if="moment.mediaType === 'video'"
              class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              Processing...
            </div>

            <!-- No Audio/Content Badge -->
            <div
              v-else-if="moment.extractedText === 'No content could be extracted from this media'"
              class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
            >
              No Audio
            </div>
          </div>

          <CardContent class="p-4">
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ getWorkerName(moment.workerId) }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ getWorkerRole(moment.workerId) }}
                    <span v-if="getWorkerDepartment(moment.workerId)"> • {{ getWorkerDepartment(moment.workerId) }}</span>
                  </p>
                </div>

                <div class="text-right">
                  <p class="text-xs text-gray-500">{{ formatDate(moment.timestamp) }}</p>
                </div>
              </div>

              <p class="text-gray-800 text-sm leading-relaxed">{{ getDisplayText(moment) }}</p>

              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>By {{ moment.submittedBy }}</span>
                <div class="flex items-center gap-1">
                  <component :is="getMediaIcon(moment.mediaType)" class="w-3 h-3" />
                  <span>{{ moment.mediaType }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import Card from '../../components/ui/Card.vue'
import CardContent from '../../components/ui/CardContent.vue'
import Button from '../../components/ui/Button.vue'
import Label from '../../components/ui/Label.vue'
import SelectWorker from '../../components/SelectWorker.vue'
import {
  Camera,
  RotateCcw,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-vue-next'
import type { Worker } from '@/services/workerService'
import type { Moment } from '@/services/momentService'
import { useMoments } from '@/composables/useMoments'

const { moments, loadMoments, isLoading } = useMoments()

// Filters
const selectedWorker = ref<Worker | null>(null)
const sortBy = ref('timestamp')
const sortOrder = ref<'asc' | 'desc'>('desc')

const handleWorkerFilter = (worker: Worker | null) => {
  selectedWorker.value = worker
  loadMoments({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    workerId: worker?._id
  })
}

const getSentimentBadgeClass = (score: number) => {
  if (score >= 70) return 'bg-green-100 text-green-800'
  if (score < 30) return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

const getMediaIcon = (mediaType: string) => {
  return mediaType === 'image' ? ImageIcon : VideoIcon
}

const getDisplayText = (moment: Moment): string => {
  if (!moment.extractedText) {
    if (moment.mediaType === 'video') {
      return 'Video is being processed for content analysis...'
    }
    return 'Processing media content...'
  }

  if (moment.extractedText === 'No content could be extracted from this media') {
    if (moment.mediaType === 'video') {
      return 'This video contains no audio content and visual analysis was unable to extract meaningful information.'
    }
    return 'Unable to extract content from this media file.'
  }

  return moment.extractedText
}

const getWorkerName = (workerId: string | Worker): string => {
  if (typeof workerId === 'string') {
    return 'Unknown Worker'
  }
  return workerId.name || 'Unknown Worker'
}

const getWorkerRole = (workerId: string | Worker): string => {
  if (typeof workerId === 'string') {
    return 'Unknown Role'
  }
  return workerId.role === 'staff' ? 'Staff' : 'Patient'
}

const getWorkerDepartment = (workerId: string | Worker): string | null => {
  if (typeof workerId === 'string') {
    return null
  }
  return workerId.department || null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadMoments({
    sortBy: sortBy.value,
    sortOrder: sortOrder.value
  })
})
</script>
