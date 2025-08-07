<template>
  <UserDashboardLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Welcome back, {{ auth.user?.name }}!</h2>
          <p class="text-gray-600">{{ userRoleText }} Dashboard - Manage your tasks and stay connected</p>
        </div>
        <div class="flex items-center space-x-3">
          <Badge :class="roleBadgeClass">
            {{ auth.user?.role === 'staff' ? 'Staff Member' : 'Patient' }}
          </Badge>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Submit Feedback Card -->
        <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="router.push('/user-dashboard/submit-feedback')">
          <CardContent class="p-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Submit Feedback</h3>
                <p class="text-sm text-gray-600">
                  {{ auth.user?.role === 'staff' ? 'Give feedback about patients and colleagues' : 'Share feedback about your assigned staff' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- AI Assistant Card -->
        <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="router.push('/user-dashboard/ai-assistant')">
          <CardContent class="p-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mic class="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">AI Assistant</h3>
                <p class="text-sm text-gray-600">
                  Voice-powered assistant for {{ auth.user?.role === 'staff' ? 'patient management' : 'feedback submission' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Manage Patients Card (Staff Only) -->
        <Card
          v-if="auth.user?.role === 'staff'"
          class="hover:shadow-md transition-shadow cursor-pointer"
          @click="router.push('/user-dashboard/manage-patients')"
        >
          <CardContent class="p-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Manage Patients</h3>
                <p class="text-sm text-gray-600">View and manage your assigned patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Activity Section -->
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div class="space-y-4">
            <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare class="w-5 h-5 text-blue-600" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">Welcome to your dashboard!</p>
                <p class="text-sm text-gray-600">Start by exploring the available features</p>
              </div>
              <span class="text-xs text-gray-500">Just now</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardContent class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button class="justify-start h-auto p-4" @click="router.push('/user-dashboard/submit-feedback')">
              <MessageSquare class="w-5 h-5 mr-3" />
              <div class="text-left">
                <div class="font-medium">Submit Feedback</div>
                <div class="text-sm opacity-75">Quick feedback submission</div>
              </div>
            </Button>

            <Button variant="outline" class="justify-start h-auto p-4" @click="router.push('/user-dashboard/ai-assistant')">
              <Mic class="w-5 h-5 mr-3" />
              <div class="text-left">
                <div class="font-medium">Use AI Assistant</div>
                <div class="text-sm opacity-75">Voice-powered assistance</div>
              </div>
            </Button>

            <Button
              v-if="auth.user?.role === 'staff'"
              variant="outline"
              class="justify-start h-auto p-4"
              @click="router.push('/user-dashboard/manage-patients')"
            >
              <Users class="w-5 h-5 mr-3" />
              <div class="text-left">
                <div class="font-medium">Manage Patients</div>
                <div class="text-sm opacity-75">View assigned patients</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </UserDashboardLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserDashboardLayout from '../../components/UserDashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { MessageSquare, Mic, Users } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const userRoleText = computed(() => {
  return auth.user?.role === 'staff' ? 'Staff' : 'Patient'
})

const roleBadgeClass = computed(() => {
  return auth.user?.role === 'staff'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800'
})
</script>
