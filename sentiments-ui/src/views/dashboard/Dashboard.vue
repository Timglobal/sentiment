<template>
  <DashboardLayout>
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="space-y-2">
        <h2 class="text-3xl font-bold text-gray-900">Welcome back Deborah Afolabi!</h2>
        <p class="text-gray-600">Manage your team and analyze workforce sentiment</p>
      </div>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <router-link to="/dashboard/submit-feedback">
          <Card class="!bg-blue-700 text-white transition-colors cursor-pointer">
            <CardContent class="p-6 text-center">
              <MessageSquare class="w-8 h-8 mx-auto mb-3" />
              <h3 class="font-semibold">Submit Feedback</h3>
            </CardContent>
          </Card>
        </router-link>

        <router-link to="/dashboard/upload-moment">
          <Card class="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
            <CardContent class="p-6 text-center">
              <Plus class="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h3 class="font-semibold text-blue-600">Upload Moment</h3>
            </CardContent>
          </Card>
        </router-link>

        <router-link to="/dashboard/manage-workers">
          <Card class="bg-green-100 border-green-200 hover:bg-green-200 transition-colors cursor-pointer">
            <CardContent class="p-6 text-center">
              <Users class="w-8 h-8 mx-auto mb-3 text-green-700" />
              <h3 class="font-semibold text-green-700">Manage Workers</h3>
            </CardContent>
          </Card>
        </router-link>

        <router-link to="/dashboard/analytics">
          <Card class="bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
            <CardContent class="p-6 text-center">
              <BarChart3 class="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h3 class="font-semibold text-blue-600">View Analytics</h3>
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
                <p class="text-3xl font-bold text-gray-900">24</p>
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
                <p class="text-3xl font-bold text-green-600">78%</p>
              </div>
              <TrendingUp class="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Moments Shared</p>
                <p class="text-3xl font-bold text-gray-900">156</p>
              </div>
              <Star class="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Team Members</p>
                <p class="text-3xl font-bold text-gray-900">45</p>
              </div>
              <Users class="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Activity -->
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <BarChart3 class="w-5 h-5 text-gray-400" />
          </div>
          <div class="space-y-4">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id" 
              class="flex items-start space-x-3"
            >
              <div :class="`w-2 h-2 rounded-full mt-2 ${activity.color}`"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ activity.action }}</p>
                <div class="flex items-center space-x-1 mt-1">
                  <Clock class="w-3 h-3 text-gray-400" />
                  <p class="text-xs text-gray-500">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
  Clock 
} from 'lucide-vue-next'

const recentActivities = ref([
  {
    id: 1,
    action: "Gave feedback for team",
    time: "2 hours ago",
    color: "bg-green-500",
  },
  {
    id: 2,
    action: "Uploaded project completion moment",
    time: "2 hours ago",
    color: "bg-green-500",
  },
  {
    id: 3,
    action: "Submitted feedback for team collaboration",
    time: "2 hours ago",
    color: "bg-orange-500",
  },
])
</script>
