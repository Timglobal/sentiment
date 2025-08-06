<template>
  <DashboardLayout>
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="space-y-2">
        <h2 class="text-3xl font-bold text-gray-900">
          Welcome back, {{ userProfile?.name || 'User' }}!
        </h2>
        <p class="text-gray-600">
          {{ dashboardData?.userContext?.isAdmin ? 'Manage your team and analyze workforce sentiment' : 'Track your contributions and team sentiment' }}
          {{ dashboardData?.userContext?.companyName ? ` at ${dashboardData.userContext.companyName}` : '' }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Loading dashboard...</p>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Action Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <router-link
            v-for="action in availableActions"
            :key="action.id"
            :to="action.route"
            class="transform transition-transform hover:scale-105"
          >
            <Card :class="getActionCardClass(action.color)">
              <CardContent class="p-6 text-center">
                <component :is="getIconComponent(action.icon)" class="w-8 h-8 mx-auto mb-3" />
                <h3 class="font-semibold">{{ action.title }}</h3>
                <p class="text-xs mt-1 opacity-75">{{ action.description }}</p>
              </CardContent>
            </Card>
          </router-link>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Total Feedback</p>
                  <p class="text-3xl font-bold text-gray-900">
                    {{ dashboardData?.statistics.totalFeedbacks || 0 }}
                  </p>
                  <div class="flex items-center mt-2">
                    <TrendingUp class="w-4 h-4 text-green-600 mr-1" />
                    <span class="text-xs text-green-600">
                      +{{ dashboardData?.statistics.weeklyFeedbacks || 0 }} this week
                    </span>
                  </div>
                </div>
                <MessageSquare class="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Positive Sentiment</p>
                  <p class="text-3xl font-bold text-green-600">
                    {{ dashboardData?.statistics.positivePercentage || 0 }}%
                  </p>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      class="bg-green-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${dashboardData?.statistics.positivePercentage || 0}%` }"
                    ></div>
                  </div>
                </div>
                <Heart class="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Moments Shared</p>
                  <p class="text-3xl font-bold text-gray-900">
                    {{ dashboardData?.statistics.totalMoments || 0 }}
                  </p>
                  <div class="flex items-center mt-2">
                    <TrendingUp class="w-4 h-4 text-purple-600 mr-1" />
                    <span class="text-xs text-purple-600">
                      +{{ dashboardData?.statistics.weeklyMoments || 0 }} this week
                    </span>
                  </div>
                </div>
                <Star class="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">
                    {{ dashboardData?.userContext?.isAdmin ? 'Team Members' : 'Average Sentiment' }}
                  </p>
                  <p class="text-3xl font-bold text-gray-900">
                    {{ dashboardData?.userContext?.isAdmin
                        ? dashboardData?.statistics.totalUsers || 0
                        : `${Math.round(dashboardData?.statistics.averageSentiment || 0)}/100`
                    }}
                  </p>
                  <div v-if="!dashboardData?.userContext?.isAdmin" class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      class="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${dashboardData?.statistics.averageSentiment || 0}%` }"
                    ></div>
                  </div>
                </div>
                <Users v-if="dashboardData?.userContext?.isAdmin" class="w-8 h-8 text-orange-600" />
                <BarChart3 v-else class="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Sentiment Analysis Overview (Admin Only) -->
        <div v-if="dashboardData?.userContext?.isAdmin && dashboardData?.statistics.sentimentAnalysis" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Feedback Sentiment</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Positive</span>
                  <span class="text-sm font-medium text-green-600">
                    {{ dashboardData.statistics.sentimentAnalysis.feedbacks.positive || 0 }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Neutral</span>
                  <span class="text-sm font-medium text-yellow-600">
                    {{ dashboardData.statistics.sentimentAnalysis.feedbacks.neutral || 0 }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Negative</span>
                  <span class="text-sm font-medium text-red-600">
                    {{ dashboardData.statistics.sentimentAnalysis.feedbacks.negative || 0 }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Moments Sentiment</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Positive</span>
                  <span class="text-sm font-medium text-green-600">
                    {{ dashboardData.statistics.sentimentAnalysis.moments.positive || 0 }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Neutral</span>
                  <span class="text-sm font-medium text-yellow-600">
                    {{ dashboardData.statistics.sentimentAnalysis.moments.neutral || 0 }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Negative</span>
                  <span class="text-sm font-medium text-red-600">
                    {{ dashboardData.statistics.sentimentAnalysis.moments.negative || 0 }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Overall Sentiment</h3>
              <div class="text-center">
                <div class="text-4xl font-bold mb-2" :class="getOverallSentimentColor()">
                  {{ Math.round(dashboardData?.statistics.averageSentiment || 0) }}/100
                </div>
                <p class="text-sm text-gray-600">
                  {{ getSentimentLabel(dashboardData?.statistics.averageSentiment || 0) }}
                </p>
                <div class="mt-4 text-xs text-gray-500">
                  Based on {{ dashboardData.statistics.sentimentAnalysis.combined.total }} analyzed items
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Recent Activity -->
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div class="flex items-center space-x-2">
                <Activity class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-500">Live feed</span>
              </div>
            </div>

            <div v-if="!dashboardData?.recentActivities || dashboardData.recentActivities.length === 0" class="text-center py-8">
              <Activity class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">No recent activities</p>
              <p class="text-sm text-gray-400 mt-1">Start by submitting feedback or sharing a moment!</p>
            </div>

            <div v-else class="space-y-4 max-h-96 overflow-y-auto">
              <div
                v-for="activity in dashboardData.recentActivities"
                :key="activity.id"
                class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div :class="`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${getActivityColor(activity.type)}`"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ activity.title }}</p>
                  <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ activity.description }}</p>
                  <div class="flex items-center space-x-4 mt-2">
                    <div class="flex items-center space-x-1">
                      <Clock class="w-3 h-3 text-gray-400" />
                      <p class="text-xs text-gray-500">{{ formatTime(activity.time) }}</p>
                    </div>
                    <div v-if="activity.sentiment !== undefined" class="flex items-center space-x-1">
                      <component :is="getSentimentIcon(activity.sentiment)" class="w-3 h-3" :class="getSentimentColor(activity.sentiment)" />
                      <span class="text-xs" :class="getSentimentColor(activity.sentiment)">
                        {{ Math.round(activity.sentiment) }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Personal Stats (Non-Admin) -->
        <div v-if="!dashboardData?.userContext?.isAdmin && userProfile?.personalStats" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent class="p-6 text-center">
              <MessageSquare class="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p class="text-2xl font-bold text-gray-900">{{ userProfile.personalStats.feedbacksSubmitted }}</p>
              <p class="text-sm text-gray-600">Feedbacks Submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6 text-center">
              <Star class="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p class="text-2xl font-bold text-gray-900">{{ userProfile.personalStats.momentsShared }}</p>
              <p class="text-sm text-gray-600">Moments Shared</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6 text-center">
              <Clock class="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p class="text-sm font-bold text-gray-900">
                {{ userProfile.personalStats.lastActivity ? formatTime(userProfile.personalStats.lastActivity) : 'No activity yet' }}
              </p>
              <p class="text-sm text-gray-600">Last Activity</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import {
  MessageSquare,
  Plus,
  Users,
  BarChart3,
  TrendingUp,
  Star,
  Clock,
  Activity,
  Heart,
  ThumbsUp,
  Meh,
  ThumbsDown
} from 'lucide-vue-next'
import dashboardService, {
  type DashboardOverview,
  type UserProfile,
  type QuickAction
} from '@/services/dashboardService'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toast-notification'

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(true)
const dashboardData = ref<DashboardOverview | null>(null)
const userProfile = ref<UserProfile | null>(null)
const quickActions = ref<QuickAction[]>([])

const availableActions = computed(() => {
  // Default actions if quick actions not loaded
  const defaultActions = [
    {
      id: 'submit-feedback',
      title: 'Submit Feedback',
      description: 'Share your thoughts',
      icon: 'MessageSquare',
      route: '/dashboard/submit-feedback',
      color: 'blue',
      available: true
    },
    {
      id: 'upload-moment',
      title: 'Upload Moment',
      description: 'Share a moment',
      icon: 'Plus',
      route: '/dashboard/upload-moment',
      color: 'green',
      available: true
    }
  ]

  // Add admin actions if user is admin
  if (dashboardData.value?.userContext?.isAdmin) {
    defaultActions.push(
      {
        id: 'manage-workers',
        title: 'Manage Workers',
        description: 'Manage team members',
        icon: 'Users',
        route: '/dashboard/manage-workers',
        color: 'purple',
        available: true
      },
      {
        id: 'view-analytics',
        title: 'View Analytics',
        description: 'Analyze performance',
        icon: 'BarChart3',
        route: '/dashboard/analytics',
        color: 'orange',
        available: true
      }
    )
  }

  return quickActions.value.length > 0 ? quickActions.value : defaultActions
})

const loadDashboardData = async () => {
  try {
    loading.value = true

    // Load data in parallel
    const [overview, profile, actions] = await Promise.all([
      dashboardService.getDashboardOverview(),
      dashboardService.getUserProfile(),
      dashboardService.getQuickActions().catch(() => ({ actions: [] })) // Don't fail if this endpoint is not available
    ])

    dashboardData.value = overview
    userProfile.value = profile
    quickActions.value = actions.actions || []

  } catch (error: any) {
    console.error('Error loading dashboard data:', error)
    toast.error('Failed to load dashboard data: ' + (error.message || 'Unknown error'))

    // Fallback to auth store user data if available
    if (authStore.user) {
      userProfile.value = authStore.user
    }
  } finally {
    loading.value = false
  }
}

const getActionCardClass = (color: string) => {
  const colorClasses = {
    blue: 'bg-blue-700 text-white hover:bg-blue-800',
    green: 'border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50',
    purple: 'bg-purple-100 border-purple-200 hover:bg-purple-200',
    orange: 'bg-orange-100 border-orange-200 hover:bg-orange-200'
  }
  return colorClasses[color as keyof typeof colorClasses] || 'border-2 border-dashed border-gray-300 hover:border-blue-400'
}

const getIconComponent = (iconName: string) => {
  const icons = {
    MessageSquare,
    Plus,
    Users,
    BarChart3,
    TrendingUp,
    Star,
    Clock,
    Activity,
    Heart
  }
  return icons[iconName as keyof typeof icons] || MessageSquare
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'feedback':
      return 'bg-blue-500'
    case 'moment':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const getSentimentIcon = (sentiment: number) => {
  if (sentiment >= 60) return ThumbsUp
  if (sentiment >= 40) return Meh
  return ThumbsDown
}

const getSentimentColor = (sentiment: number) => {
  if (sentiment >= 60) return 'text-green-600'
  if (sentiment >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const getOverallSentimentColor = () => {
  const sentiment = dashboardData.value?.statistics.averageSentiment || 0
  if (sentiment >= 60) return 'text-green-600'
  if (sentiment >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const getSentimentLabel = (sentiment: number) => {
  if (sentiment >= 80) return 'Excellent'
  if (sentiment >= 60) return 'Good'
  if (sentiment >= 40) return 'Neutral'
  if (sentiment >= 20) return 'Poor'
  return 'Very Poor'
}

const formatTime = (timeString: string) => {
  try {
    const date = new Date(timeString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / (24 * 60))
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  } catch (error) {
    return timeString
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
