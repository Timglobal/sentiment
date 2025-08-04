<template>
  <div v-if="isMobileSidebarOpen" class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" @click="closeMobileSidebar"></div>
  
  <div
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-screen overflow-y-auto',
      'transform transition-transform duration-300 ease-in-out lg:transform-none',
      isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Header -->
    <div class="p-6 border-b">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <User class="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">User Dashboard</h3>
          <p class="text-sm text-gray-600">Feedback & Analytics</p>
        </div>
      </div>
    </div>
    
    <!-- Navigation -->
    <div class="p-4 flex-1">
      <nav class="space-y-2">
        <router-link
          v-for="item in sidebarItems"
          :key="item.id"
          :to="item.href"
          :class="[
            'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
            isActive(item.href)
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          ]"
          @click="closeMobileSidebar"
        >
          <component :is="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- User Profile -->
    <div class="p-4 border-t mt-auto">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User class="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p class="font-medium text-gray-900 text-sm">John Doe</p>
          <p class="text-xs text-gray-600">Staff Member</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { 
  MessageSquare, 
  BarChart3, 
  Settings, 
  User, 
  Home, 
  Star 
} from 'lucide-vue-next'

interface SidebarItem {
  id: string
  label: string
  icon: any
  href: string
}

interface Props {
  isMobileSidebarOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const route = useRoute()

const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "Overview", icon: Home, href: "/user-dashboard" },
  { id: "submit-feedback", label: "Submit Feedback", icon: MessageSquare, href: "/user-dashboard/submit-feedback" },
  { id: "my-feedback", label: "My Feedback", icon: Star, href: "/user-dashboard/my-feedback" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/user-dashboard/analytics" },
  { id: "settings", label: "Settings", icon: Settings, href: "/user-dashboard/settings" },
]

const isActive = (href: string) => {
  return route.path === href
}

const closeMobileSidebar = () => {
  emit('close')
}
</script>
