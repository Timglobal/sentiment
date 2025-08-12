<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Mobile Sidebar Backdrop -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="closeMobileSidebar"
      aria-hidden="true"
    />

    <!-- Sidebar -->
    <UserDashboardSidebar
      :is-mobile-sidebar-open="isMobileSidebarOpen"
      @close="closeMobileSidebar"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-64 min-h-screen">
      <!-- Header - Fixed -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Mobile Hamburger Button -->
            <button
              @click="toggleMobileSidebar"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu class="h-6 w-6 text-gray-600" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">{{ getCurrentPageTitle() }}</h1>
          </div>
          <div class="flex items-center space-x-4">
            <Badge :class="auth.user?.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
              {{ auth.user?.role === 'staff' ? 'Staff Member' : 'Patient' }}
            </Badge>
            <div class="relative">
              <Bell class="w-6 h-6 text-gray-600" />
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User class="w-4 h-4 text-gray-600" />
              </div>
              <span class="text-sm font-medium text-gray-900 hidden sm:block">{{ auth.user?.name }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Content - Scrollable -->
      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserDashboardSidebar from './UserDashboardSidebar.vue'
import Badge from './ui/Badge.vue'
import { Menu, Bell, User } from 'lucide-vue-next'

const route = useRoute()
const auth = useAuthStore()
const isMobileSidebarOpen = ref(false)

// Sidebar items - should match the UserDashboardSidebar component
const sidebarItems = [
  { id: "user-dashboard", label: "Dashboard", href: "/user-dashboard" },
  { id: "submit-feedback", label: "Submit Feedback", href: "/user-dashboard/submit-feedback" },
  { id: "manage-patients", label: "Manage Patients", href: "/user-dashboard/manage-patients" },
  { id: "ai-assistant", label: "AI Assistant", href: "/user-dashboard/ai-assistant" },
  { id: "my-feedback", label: "My Feedback", href: "/user-dashboard/my-feedback" },
  { id: "analytics", label: "Analytics", href: "/user-dashboard/analytics" },
  { id: "settings", label: "Settings", href: "/user-dashboard/settings" },
]

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

// Get current page title based on pathname
const getCurrentPageTitle = () => {
  const currentItem = sidebarItems.find((item) => item.href === route.path)
  return currentItem?.label || "User Dashboard"
}

// Close menu on escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeMobileSidebar()
  }
}

// Watch for mobile sidebar changes to handle body overflow
watch(isMobileSidebarOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'unset'
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = 'unset'
})
</script>
