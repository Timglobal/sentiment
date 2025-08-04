<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Feedback Management</h2>
          <p class="text-gray-600">View and analyze all feedback submissions</p>
        </div>
        <Button @click="loadStats" :disabled="isLoadingStats" class="bg-green-600 hover:bg-green-700">
          <BarChart3 class="w-4 h-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      <!-- Stats Cards -->
      <div v-if="feedbackStats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <MessageSquare class="h-8 w-8 text-blue-600" />
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.totalFeedbacks }}</p>
                <p class="text-gray-600">Total Feedbacks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <ThumbsUp class="h-8 w-8 text-green-600" />
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.positiveCount }}</p>
                <p class="text-gray-600">Positive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <Minus class="h-8 w-8 text-yellow-600" />
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.neutralCount }}</p>
                <p class="text-gray-600">Neutral</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center">
              <ThumbsDown class="h-8 w-8 text-red-600" />
              <div class="ml-4">
                <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.negativeCount }}</p>
                <p class="text-gray-600">Negative</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Filters -->
      <Card>
        <CardContent class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Sentiment Filter
              </Label>
              <select
                v-model="sentimentFilter"
                @change="loadFeedbacks({
                  ...currentFilters,
                  sentimentFilter: sentimentFilter || undefined,
                  page: 1
                })"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sentiments</option>
                <option value="positive">Positive (70+)</option>
                <option value="neutral">Neutral (30-69)</option>
                <option value="negative">Negative (<30)</option>
              </select>
            </div>

            <div>
              <Label class="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </Label>
              <select
                v-model="sortBy"
                @change="loadFeedbacks({
                  ...currentFilters,
                  sortBy,
                  sentimentFilter: sentimentFilter || undefined,
                  page: 1
                })"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="timestamp">Date</option>
                <option value="sentimentScore">Sentiment Score</option>
                <option value="workerName">Worker Name</option>
              </select>
            </div>

            <div>
              <Label class="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </Label>
              <select
                v-model="sortOrder"
                @change="loadFeedbacks({
                  ...currentFilters,
                  sortOrder,
                  sentimentFilter: sentimentFilter || undefined,
                  page: 1
                })"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Feedback List -->
      <Card>
        <CardContent class="p-6">
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-else-if="feedbacks.length === 0" class="text-center py-8">
            <MessageSquare class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600">No feedbacks found matching your criteria</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="feedback in feedbacks"
              :key="feedback._id"
              class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-2">
                    <h3 class="font-semibold text-gray-900">{{ feedback.senderName }}</h3>
                    <span class="text-sm text-gray-600">{{ feedback.senderEmail }}</span>
                    <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {{ feedback.source }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">
                    Feedback for: <span class="font-medium">{{ feedback.workerName }}</span>
                  </p>
                </div>

                <div class="text-right">
                  <div v-if="feedback.sentimentScore !== null && feedback.sentimentScore !== undefined" class="flex items-center gap-2">
                    <component
                      :is="getSentimentIcon(feedback.sentimentScore)"
                      :class="getSentimentColor(feedback.sentimentScore)"
                      class="w-5 h-5"
                    />
                    <span class="text-sm font-medium">{{ feedback.sentimentScore }}%</span>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <Minus class="w-5 h-5 text-gray-400" />
                    <span class="text-sm text-gray-500">No score</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ formatDate(feedback.timestamp) }}
                  </p>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-gray-800">{{ feedback.message }}</p>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="flex justify-between items-center mt-6 pt-6 border-t">
            <p class="text-sm text-gray-700">
              Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
              {{ pagination.total }} results
            </p>

            <div class="flex gap-2">
              <Button
                @click="changePage(pagination.page - 1)"
                :disabled="!pagination.hasPrevPage"
                variant="outline"
                size="sm"
              >
                <ChevronLeft class="w-4 h-4" />
                Previous
              </Button>

              <Button
                @click="changePage(pagination.page + 1)"
                :disabled="!pagination.hasNextPage"
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import Card from '../../components/ui/Card.vue'
import CardContent from '../../components/ui/CardContent.vue'
import Button from '../../components/ui/Button.vue'
import Label from '../../components/ui/Label.vue'
import SelectWorker from '../../components/SelectWorker.vue'
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import type { Worker } from '@/services/workerService'
import { useFeedback } from '@/composables/useFeedback'

const {
  feedbacks,
  feedbackStats,
  pagination,
  isLoading,
  isLoadingStats,
  loadFeedbacks,
  loadFeedbackStats
} = useFeedback()

// Filters
const selectedWorker = ref<Worker | null>(null)
const sentimentFilter = ref<'positive' | 'negative' | 'neutral' | ''>('')
const sortBy = ref('timestamp')
const sortOrder = ref<'asc' | 'desc'>('desc')

const currentFilters = computed(() => ({
  page: pagination.value.page,
  limit: 10,
  workerId: selectedWorker.value?._id,
  sentimentFilter: sentimentFilter.value || undefined,
  sortBy: sortBy.value,
  sortOrder: sortOrder.value
}))

const handleWorkerFilter = (worker: Worker | null) => {
  selectedWorker.value = worker
  loadFeedbacks({
    ...currentFilters.value,
    page: 1,
    workerId: worker?._id,
    sentimentFilter: sentimentFilter.value || undefined
  })
}

const changePage = (page: number) => {
  loadFeedbacks({
    ...currentFilters.value,
    page,
    sentimentFilter: sentimentFilter.value || undefined
  })
}

const loadStats = () => {
  loadFeedbackStats({
    workerId: selectedWorker.value?._id
  })
}

const getSentimentIcon = (score: number | undefined) => {
  if (!score) return Minus
  if (score >= 70) return ThumbsUp
  if (score < 30) return ThumbsDown
  return Minus
}

const getSentimentColor = (score: number | undefined) => {
  if (!score) return 'text-gray-400'
  if (score >= 70) return 'text-green-600'
  if (score < 30) return 'text-red-600'
  return 'text-yellow-600'
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
  loadFeedbacks({
    ...currentFilters.value,
    sentimentFilter: sentimentFilter.value || undefined
  })
  loadStats()
})
</script>
