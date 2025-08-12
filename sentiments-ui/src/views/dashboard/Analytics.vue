<template>
  <DashboardLayout>
    <div class="space-y-6 md:space-y-8">
      <!-- Header Section -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Company Analytics
            </h1>
            <p class="text-gray-600 mt-1">
              Comprehensive sentiment analysis and performance insights
            </p>

            <!-- Filter Status -->
            <div v-if="selectedDepartment !== 'all' || selectedWorkerObject !== null || selectedSource !== 'all'" class="mt-3 flex flex-wrap gap-2">
              <span
                v-if="selectedDepartment !== 'all'"
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                <Building class="w-3 h-3 mr-1" />
                Department: {{ selectedDepartment }}
              </span>
              <span
                v-if="selectedWorkerObject !== null"
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
              >
                <Users class="w-3 h-3 mr-1" />
                Worker: {{ selectedWorkerObject.name }}
              </span>
              <span
                v-if="selectedSource !== 'all'"
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
              >
                <BarChart3 class="w-3 h-3 mr-1" />
                Source: {{ selectedSource === 'feedback' ? 'Feedback' : 'Moments' }}
              </span>
            </div>
          </div>

          <!-- Controls Section - Responsive Layout -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
            <!-- Time Range Selector -->
            <div class="sm:col-span-1">
              <select
                v-model="selectedTimeRange"
                @change="loadAnalytics"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <!-- Department Filter -->
            <div class="sm:col-span-1">
              <select
                v-model="selectedDepartment"
                @change="loadAnalytics"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Departments</option>
                <option
                  v-for="dept in availableDepartments"
                  :key="dept"
                  :value="dept"
                >
                  {{ dept }}
                </option>
              </select>
            </div>

            <!-- Worker Filter using SelectWorker Component -->
            <div class="sm:col-span-1 lg:col-span-1">
              <SelectWorker
                :selected-worker="selectedWorkerObject"
                trigger-label="Select Worker"
                placeholder="All Workers"
                :role-filter="null"
                @worker-select="handleWorkerSelect"
              />
            </div>

            <!-- Source Filter -->
            <div class="sm:col-span-1">
              <select
                v-model="selectedSource"
                @change="loadAnalytics"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Sources</option>
                <option value="feedback">Feedback Only</option>
                <option value="moments">Moments Only</option>
              </select>
            </div>

            <!-- Clear Filters Button -->
            <div class="sm:col-span-1 lg:col-span-1">
              <button
                v-if="selectedDepartment !== 'all' || selectedWorkerObject !== null || selectedSource !== 'all'"
                @click="clearFilters"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 text-sm transition-colors"
              >
                <X class="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>

            <!-- Export Button -->
            <div class="sm:col-span-1 lg:col-span-1">
              <button
                @click="exportData"
                :disabled="loading"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm transition-colors"
              >
                <Download class="w-4 h-4 mr-2" />
                <span class="hidden sm:inline">Export</span>
              </button>
            </div>

            <!-- Refresh Button -->
            <div class="sm:col-span-1 lg:col-span-1">
              <button
                @click="loadAnalytics"
                :disabled="loading"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 disabled:opacity-50 text-sm transition-colors"
              >
                <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
                <span class="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !analytics" class="flex items-center justify-center p-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading comprehensive analytics...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center">
          <AlertTriangle class="h-5 w-5 text-red-400 mr-3" />
          <div>
            <h3 class="text-sm font-medium text-red-800">Failed to load analytics</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="loadAnalytics"
              class="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Analytics Content -->
      <div v-else-if="analytics" class="space-y-6">
        <!-- Key Performance Indicators -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <!-- Overall Sentiment -->
          <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-600 mb-1">Overall Sentiment</p>
                <p class="text-2xl sm:text-3xl font-bold text-blue-600">
                  {{ analytics.data?.executiveSummary?.overallSentiment || 0 }}%
                </p>
                <p class="text-xs text-gray-500 mt-1">Based on feedback analysis</p>
              </div>
              <Heart class="w-8 h-8 text-pink-600 flex-shrink-0 ml-3" />
            </div>
          </div>

          <!-- Total Engagement -->
          <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-600 mb-1">Total Engagement</p>
                <p class="text-2xl sm:text-3xl font-bold text-gray-900">
                  {{ (analytics.data?.executiveSummary?.totalFeedbacks || 0) + (analytics.data?.executiveSummary?.totalMoments || 0) }}
                </p>
                <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-2 space-y-1 sm:space-y-0">
                  <span class="text-xs text-blue-600">{{ analytics.data?.executiveSummary?.totalFeedbacks || 0 }} feedbacks</span>
                  <span class="text-xs text-purple-600">{{ analytics.data?.executiveSummary?.totalMoments || 0 }} moments</span>
                </div>
              </div>
              <Activity class="w-8 h-8 text-blue-600 flex-shrink-0 ml-3" />
            </div>
          </div>

          <!-- Team Members -->
          <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-600 mb-1">Team Members</p>
                <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ analytics.data?.executiveSummary?.totalUsers || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Active users</p>
              </div>
              <Users class="w-8 h-8 text-orange-600 flex-shrink-0 ml-3" />
            </div>
          </div>

          <!-- Departments -->
          <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-600 mb-1">Departments</p>
                <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ analytics.data?.performance?.departments?.length || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Active departments</p>
              </div>
              <Building class="w-8 h-8 text-green-600 flex-shrink-0 ml-3" />
            </div>
          </div>
        </div>

        <!-- Sentiment Trend Chart -->
        <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp class="w-5 h-5 text-blue-500 mr-2" />
            Sentiment Trend{{ selectedDepartment !== 'all' ? ` - ${selectedDepartment}` : '' }}{{ selectedWorkerObject ? ` - ${selectedWorkerObject.name}` : '' }} (Last 30 Days)
          </h3>
          <div v-if="chartData && chartData.labels.length > 0" class="h-64 sm:h-80">
            <Line
              :data="chartData"
              :options="chartOptions"
              class="w-full h-full"
            />
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <TrendingUp class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No trend data available</p>
            <p class="text-sm mt-1">Trend data will appear once feedback is analyzed over time</p>
          </div>
        </div>

        <!-- Insights Panel -->
        <div v-if="analytics.data?.insights && analytics.data.insights.length > 0" class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb class="w-5 h-5 text-yellow-500 mr-2" />
            Key Insights
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="(insight, index) in analytics.data.insights"
              :key="index"
              :class="[
                'p-4 rounded-lg border-l-4 hover:bg-opacity-80 transition-colors',
                getInsightClasses(insight.type)
              ]"
            >
              <div class="flex items-start">
                <component
                  :is="getInsightIcon(insight.type)"
                  class="w-5 h-5 mt-0.5 mr-3 flex-shrink-0"
                />
                <div class="min-w-0">
                  <h4 class="font-medium text-sm mb-1 capitalize">{{ insight.type }}</h4>
                  <p class="text-xs opacity-90 leading-relaxed">{{ insight.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- Sentiment Overview -->
          <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Sentiment Overview
              <span v-if="selectedSource !== 'all'" class="text-sm font-normal text-gray-500 ml-2">
                ({{ selectedSource === 'feedback' ? 'Feedback Only' : 'Moments Only' }})
              </span>
            </h3>
            <div v-if="getSentimentData().hasData" class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span class="text-sm text-green-600 flex items-center">
                  <div class="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                  Excellent:
                </span>
                <span class="font-medium">{{ getSentimentData().excellent }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span class="text-sm text-green-500 flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Very Positive:
                </span>
                <span class="font-medium">{{ getSentimentData().veryPositive }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span class="text-sm text-blue-600 flex items-center">
                  <div class="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                  Positive:
                </span>
                <span class="font-medium">{{ getSentimentData().positive }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span class="text-sm text-yellow-600 flex items-center">
                  <div class="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
                  Neutral:
                </span>
                <span class="font-medium">{{ getSentimentData().neutral }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span class="text-sm text-orange-600 flex items-center">
                  <div class="w-3 h-3 bg-orange-600 rounded-full mr-2"></div>
                  Negative:
                </span>
                <span class="font-medium">{{ getSentimentData().negative }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm text-red-600 flex items-center">
                  <div class="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  Very Negative:
                </span>
                <span class="font-medium">{{ getSentimentData().veryNegative }}</span>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-700">Total Analyzed:</span>
                  <span class="font-bold text-gray-900">{{ getSentimentData().totalAnalyzed }}</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-sm font-medium text-gray-700">Average Sentiment:</span>
                  <span class="font-bold text-blue-600">{{ getSentimentData().avgSentiment }}%</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              <PieChart class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sentiment data available</p>
            </div>
          </div>

          <!-- Department Performance -->
          <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Department Performance
              <span v-if="selectedSource !== 'all'" class="text-sm font-normal text-gray-500 ml-2">
                ({{ selectedSource === 'feedback' ? 'Feedback Only' : 'Moments Only' }})
              </span>
            </h3>
            <div v-if="analytics.data?.performance?.departments && analytics.data.performance.departments.length > 0" class="space-y-3">
              <div
                v-for="dept in analytics.data.performance.departments.slice(0, 5)"
                :key="dept._id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-gray-900 truncate">{{ dept._id || 'No Department' }}</p>
                  <p class="text-sm text-gray-600">
                    {{ dept.totalWorkers || dept.workerCount || 0 }} workers •
                    <span v-if="selectedSource === 'feedback'">{{ dept.totalFeedbacks || 0 }} feedbacks</span>
                    <span v-else-if="selectedSource === 'moments'">{{ dept.totalMoments || 0 }} moments</span>
                    <span v-else>{{ (dept.totalFeedbacks || 0) + (dept.totalMoments || 0) }} total items</span>
                  </p>
                </div>
                <div class="text-right ml-3 flex-shrink-0">
                  <p class="font-bold text-blue-600">
                    {{ Math.round(dept.avgSentiment || dept.overallSentiment || 0) }}%
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              <Building class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No department data available</p>
            </div>
          </div>
        </div>

        <!-- Worker Performance -->
        <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Worker Performance
            <span v-if="selectedSource !== 'all'" class="text-sm font-normal text-gray-500 ml-2">
              ({{ selectedSource === 'feedback' ? 'Feedback Only' : 'Moments Only' }})
            </span>
          </h3>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- Top Performers -->
            <div v-if="analytics.data?.performance?.workers?.topPerformers && analytics.data.performance.workers.topPerformers.length > 0">
              <h4 class="text-sm font-medium text-green-700 mb-3 flex items-center">
                <Award class="w-4 h-4 mr-2" />
                Top Performers
              </h4>
              <div class="space-y-3">
                <div
                  v-for="worker in analytics.data.performance.workers.topPerformers.slice(0, 3)"
                  :key="worker._id"
                  class="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ worker.name }}</p>
                    <p class="text-xs text-gray-600">
                      {{ worker.department }} •
                      <span v-if="selectedSource === 'feedback'">{{ worker.feedbackCount || worker.totalFeedbacks || 0 }} feedbacks</span>
                      <span v-else-if="selectedSource === 'moments'">{{ worker.momentCount || worker.totalMoments || 0 }} moments</span>
                      <span v-else>{{ getWorkerTotalItems(worker) }} total items</span>
                    </p>
                  </div>
                  <div class="text-right ml-3 flex-shrink-0">
                    <p class="text-sm font-bold text-green-600">{{ Math.round(worker.avgSentiment || 0) }}%</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Needs Attention -->
            <div v-if="analytics.data?.performance?.workers?.needsAttention && analytics.data.performance.workers.needsAttention.length > 0">
              <h4 class="text-sm font-medium text-red-700 mb-3 flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" />
                Needs Attention
              </h4>
              <div class="space-y-3">
                <div
                  v-for="worker in analytics.data.performance.workers.needsAttention.slice(0, 3)"
                  :key="worker._id"
                  class="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ worker.name }}</p>
                    <p class="text-xs text-gray-600">
                      {{ worker.department }} •
                      <span v-if="selectedSource === 'feedback'">{{ worker.feedbackCount || worker.totalFeedbacks || 0 }} feedbacks</span>
                      <span v-else-if="selectedSource === 'moments'">{{ worker.momentCount || worker.totalMoments || 0 }} moments</span>
                      <span v-else>{{ getWorkerTotalItems(worker) }} total items</span>
                    </p>
                  </div>
                  <div class="text-right ml-3 flex-shrink-0">
                    <p class="text-sm font-bold text-red-600">{{ Math.round(worker.avgSentiment || 0) }}%</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- All Workers Performing Well -->
            <div v-else-if="analytics.data?.performance?.workers?.topPerformers && analytics.data.performance.workers.topPerformers.length > 0 && (!analytics.data?.performance?.workers?.needsAttention || analytics.data.performance.workers.needsAttention.length === 0)">
              <h4 class="text-sm font-medium text-green-700 mb-3 flex items-center">
                <CheckCircle class="w-4 h-4 mr-2" />
                Excellent Performance
              </h4>
              <div class="p-4 bg-green-50 rounded-lg border border-green-200">
                <div class="flex items-center">
                  <CheckCircle class="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p class="text-sm font-medium text-green-800">All workers are performing excellently!</p>
                    <p class="text-xs text-green-600 mt-1">No workers currently need attention. Keep up the great work!</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Worker Data -->
            <div v-if="(!analytics.data?.performance?.workers?.topPerformers || analytics.data.performance.workers.topPerformers.length === 0) &&
                      (!analytics.data?.performance?.workers?.needsAttention || analytics.data.performance.workers.needsAttention.length === 0)"
                 class="col-span-full text-center text-gray-500 py-8">
              <Users class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No worker performance data available</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-12">
        <div class="text-center">
          <BarChart3 class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p class="text-gray-600 mb-4">There's no analytics data available yet. This could be because:</p>
          <ul class="text-sm text-gray-500 space-y-1 mb-6">
            <li>• No feedback has been submitted yet</li>
            <li>• Your account doesn't have the required permissions</li>
            <li>• The system is still processing recent data</li>
          </ul>
          <button
            @click="loadAnalytics"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Retry Loading
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import SelectWorker from '@/components/SelectWorker.vue'
import analyticsService from '@/services/analyticsService'
import type { Worker } from '@/services/workerService'
import { useToast } from 'vue-toast-notification'
import {
  Line
} from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import {
  Heart,
  Activity,
  Users,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  PieChart,
  Building,
  Award,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Info,
  X
} from 'lucide-vue-next'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Define the analytics response type based on actual API structure
interface AnalyticsResponse {
  success: boolean
  message?: string
  data?: {
    executiveSummary?: {
      overallSentiment?: number
      totalFeedbacks?: number
      totalMoments?: number
      totalUsers?: number
    }
    sentimentOverview?: {
      breakdown?: {
        feedback?: {
          excellent?: number
          veryPositive?: number
          positive?: number
          neutral?: number
          negative?: number
          veryNegative?: number
          avgSentiment?: number
          totalAnalyzed?: number
        }
        moments?: {
          excellent?: number
          veryPositive?: number
          positive?: number
          neutral?: number
          negative?: number
          veryNegative?: number
          avgSentiment?: number
          totalAnalyzed?: number
        }
      }
    }
    trends?: {
      daily?: Array<{
        _id: string
        avgSentiment: number
        count: number
      }>
    }
    performance?: {
      departments?: Array<{
        _id: string
        totalWorkers?: number
        totalFeedbacks?: number
        totalMoments?: number
        avgSentiment?: number
        workerCount?: number
        overallSentiment?: number
      }>
      workers?: {
        topPerformers?: Array<{
          _id: string
          name: string
          department: string
          feedbackCount?: number
          momentCount?: number
          totalFeedbacks?: number
          totalMoments?: number
          avgSentiment?: number
        }>
        needsAttention?: Array<{
          _id: string
          name: string
          department: string
          feedbackCount?: number
          momentCount?: number
          totalFeedbacks?: number
          totalMoments?: number
          avgSentiment?: number
        }>
      }
    }
    insights?: Array<{
      type: string
      message: string
    }>
  }
}

const toast = useToast()
const loading = ref(false)
const error = ref<string | null>(null)
const analytics = ref<AnalyticsResponse | null>(null)

// Filter variables
const selectedTimeRange = ref('30d')
const selectedDepartment = ref('all')
const selectedWorkerObject = ref<Worker | null>(null)
const selectedSource = ref('all')
const availableDepartments = ref<string[]>([])
const availableWorkers = ref<Worker[]>([])

// Handle worker selection from SelectWorker component
const handleWorkerSelect = (worker: Worker | null) => {
  selectedWorkerObject.value = worker
  loadAnalytics()
}

// Load departments and workers on mount
const loadFiltersData = async () => {
  try {
    // First load basic analytics to get available departments and workers
    const response = await analyticsService.getComprehensiveAnalytics('30d')

    if (response.success && response.data) {
      // Extract departments from performance data
      const departments = response.data.performance?.departments?.map(dept => dept._id).filter(Boolean) || []
      availableDepartments.value = [...new Set(departments)].sort()

      // Extract workers from performance data
      const workers: Worker[] = []
      if (response.data.performance?.workers?.topPerformers) {
        workers.push(...response.data.performance.workers.topPerformers.map(w => ({
          _id: w._id,
          name: w.name,
          email: '', // We'll need to get this from the worker service
          role: 'staff' as const,
          department: w.department,
          company: '',
          createdAt: '',
          updatedAt: ''
        })))
      }
      if (response.data.performance?.workers?.needsAttention) {
        workers.push(...response.data.performance.workers.needsAttention.map(w => ({
          _id: w._id,
          name: w.name,
          email: '', // We'll need to get this from the worker service
          role: 'staff' as const,
          department: w.department,
          company: '',
          createdAt: '',
          updatedAt: ''
        })))
      }

      // Remove duplicates and sort
      const uniqueWorkers = workers.filter((worker, index, self) =>
        index === self.findIndex(w => w._id === worker._id)
      ).sort((a, b) => a.name.localeCompare(b.name))

      availableWorkers.value = uniqueWorkers
    }
  } catch (error) {
    console.error('Failed to load filter data:', error)
  }
}

// Computed property to filter workers based on selected department
const filteredWorkers = computed(() => {
  if (selectedDepartment.value === 'all') {
    return availableWorkers.value
  }
  return availableWorkers.value.filter(worker => worker.department === selectedDepartment.value)
})

// Chart data for sentiment trend
const chartData = computed(() => {
  if (!analytics.value?.data?.trends?.daily || analytics.value.data.trends.daily.length === 0) {
    return null
  }

  const trendData = analytics.value.data.trends.daily

  // Filter out any invalid data points
  const validTrends = trendData.filter(point =>
    point._id &&
    point.avgSentiment !== null &&
    point.avgSentiment !== undefined &&
    !isNaN(point.avgSentiment)
  )

  if (validTrends.length === 0) {
    return null
  }

  const labels = validTrends.map(point => {
    const date = new Date(point._id)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const sentiments = validTrends.map(point => Math.round(point.avgSentiment * 100) / 100)

  return {
    labels,
    datasets: [
      {
        label: 'Average Sentiment',
        data: sentiments,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  }
})

// Chart options for responsive design
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        title: (context: any) => {
          const date = new Date(analytics.value?.data?.trends?.daily?.[context[0].dataIndex]._id || '')
          return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        },
        label: (context: any) => {
          const trendPoint = analytics.value?.data?.trends?.daily?.[context.dataIndex]
          return [
            `Sentiment: ${context.parsed.y.toFixed(1)}%`,
            `Feedback Count: ${trendPoint?.count || 0}`
          ]
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxTicksLimit: 7,
        color: 'rgb(107, 114, 128)'
      }
    },
    y: {
      min: 0,
      max: 100,
      grid: {
        color: 'rgba(107, 114, 128, 0.1)'
      },
      ticks: {
        color: 'rgb(107, 114, 128)',
        callback: (value: any) => `${value}%`
      }
    }
  },
  elements: {
    point: {
      hoverBorderWidth: 3
    }
  }
}))

// Watch for department changes and reset worker selection
watch(selectedDepartment, (newDept) => {
  if (newDept !== 'all') {
    // If a specific department is selected, reset worker selection
    selectedWorkerObject.value = null
  }
})

// Clear all filters
const clearFilters = async () => {
  selectedDepartment.value = 'all'
  selectedWorkerObject.value = null
  selectedSource.value = 'all'
  await loadAnalytics()
}

const loadAnalytics = async () => {
  try {
    loading.value = true
    error.value = null

    // Check if filters are applied
    const hasFilters = selectedDepartment.value !== 'all' || selectedWorkerObject.value !== null || selectedSource.value !== 'all'

    let response
    if (hasFilters) {
      // Use filtered analytics
      const filterParams = {
        department: selectedDepartment.value,
        workerId: selectedWorkerObject.value?._id || 'all',
        source: selectedSource.value,
        timeRange: selectedTimeRange.value
      }
      response = await analyticsService.getFilteredAnalytics(filterParams)
    } else {
      // Use comprehensive analytics
      response = await analyticsService.getComprehensiveAnalytics(selectedTimeRange.value)
    }

    analytics.value = response

    if (!response || !response.success) {
      throw new Error(response?.message || 'Failed to load analytics')
    }

    console.log('Analytics loaded:', response)
  } catch (err: any) {
    console.error('Failed to load analytics:', err)
    error.value = err.message || 'Failed to load analytics data'
    toast.error(error.value || 'Failed to load analytics data')
  } finally {
    loading.value = false
  }
}

const exportData = async () => {
  try {
    if (!analytics.value) {
      toast.warning('No data to export')
      return
    }

    const dataStr = JSON.stringify(analytics.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-${selectedTimeRange.value}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Analytics data exported successfully')
  } catch (err: any) {
    console.error('Export failed:', err)
    toast.error('Failed to export data')
  }
}

// Get combined sentiment data based on source filter
const getSentimentData = () => {
  if (!analytics.value?.data?.sentimentOverview?.breakdown) {
    return {
      hasData: false,
      excellent: 0,
      veryPositive: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      veryNegative: 0,
      totalAnalyzed: 0,
      avgSentiment: 0
    }
  }

  const breakdown = analytics.value.data.sentimentOverview.breakdown
  const feedback = breakdown.feedback || {}
  const moments = breakdown.moments || {}

  let data: any
  if (selectedSource.value === 'feedback') {
    data = feedback
  } else if (selectedSource.value === 'moments') {
    data = moments
  } else {
    // Combined data
    data = {
      excellent: (feedback.excellent || 0) + (moments.excellent || 0),
      veryPositive: (feedback.veryPositive || 0) + (moments.veryPositive || 0),
      positive: (feedback.positive || 0) + (moments.positive || 0),
      neutral: (feedback.neutral || 0) + (moments.neutral || 0),
      negative: (feedback.negative || 0) + (moments.negative || 0),
      veryNegative: (feedback.veryNegative || 0) + (moments.veryNegative || 0),
      totalAnalyzed: (feedback.totalAnalyzed || 0) + (moments.totalAnalyzed || 0),
      avgSentiment: (feedback.totalAnalyzed || 0) > 0 && (moments.totalAnalyzed || 0) > 0
        ? ((feedback.avgSentiment || 0) * (feedback.totalAnalyzed || 0) + (moments.avgSentiment || 0) * (moments.totalAnalyzed || 0)) / ((feedback.totalAnalyzed || 0) + (moments.totalAnalyzed || 0))
        : (feedback.avgSentiment || 0) || (moments.avgSentiment || 0)
    }
  }

  return {
    hasData: (data.totalAnalyzed || 0) > 0,
    excellent: data.excellent || 0,
    veryPositive: data.veryPositive || 0,
    positive: data.positive || 0,
    neutral: data.neutral || 0,
    negative: data.negative || 0,
    veryNegative: data.veryNegative || 0,
    totalAnalyzed: data.totalAnalyzed || 0,
    avgSentiment: Math.round((data.avgSentiment || 0) * 100) / 100
  }
}

// Get worker total items based on source filter
const getWorkerTotalItems = (worker: any) => {
  if (selectedSource.value === 'feedback') {
    return worker.feedbackCount || worker.totalFeedbacks || 0
  } else if (selectedSource.value === 'moments') {
    return worker.momentCount || worker.totalMoments || 0
  } else {
    return (worker.feedbackCount || worker.totalFeedbacks || 0) + (worker.momentCount || worker.totalMoments || 0)
  }
}

const formatTimeRange = (range: string) => {
  const ranges = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '1y': 'Last year'
  }
  return ranges[range as keyof typeof ranges] || range
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatTrend = (value: number) => {
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
}

const getSentimentColor = (sentiment: number) => {
  if (sentiment >= 70) return 'text-green-600 bg-green-100'
  if (sentiment >= 50) return 'text-blue-600 bg-blue-100'
  if (sentiment >= 30) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

const getTrendColor = (trend: number) => {
  if (trend > 0) return 'text-green-600'
  if (trend < 0) return 'text-red-600'
  return 'text-gray-600'
}

const calculatePositiveRate = () => {
  const feedbacks = analytics.value?.data?.sentimentOverview?.breakdown?.feedback
  if (!feedbacks) return 0
  const positive = (feedbacks.excellent || 0) + (feedbacks.veryPositive || 0) + (feedbacks.positive || 0)
  const total = Object.values(feedbacks).reduce((sum, count) => sum + count, 0)
  return total > 0 ? Math.round((positive / total) * 100) : 0
}

const getInsightClasses = (type: string) => {
  switch (type) {
    case 'positive':
      return 'bg-green-50 border-green-400 text-green-800'
    case 'warning':
      return 'bg-yellow-50 border-yellow-400 text-yellow-800'
    case 'info':
      return 'bg-blue-50 border-blue-400 text-blue-800'
    case 'negative':
    case 'attention':
      return 'bg-red-50 border-red-400 text-red-800'
    default:
      return 'bg-gray-50 border-gray-400 text-gray-800'
  }
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'positive':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'negative':
    case 'attention':
      return AlertCircle
    case 'info':
      return Info
    default:
      return Info
  }
}

const getPriorityClasses = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(async () => {
  await loadFiltersData()
  await loadAnalytics()
})
</script>
