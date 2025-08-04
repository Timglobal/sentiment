<template>
  <div
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-screen overflow-y-auto',
      'transform transition-transform duration-300 ease-in-out lg:transform-none',
      isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Logo -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2025-07-03_at_21.46.04_48bcdeab_2-removebg-preview%201%20%281%29-qusazhTXS2124OdkpQikqHGGcpQQ8J.png"
            alt="Timglobal Logo"
            class="w-8 h-8"
          />
          <span class="font-bold text-xl text-gray-900">Timglobal</span>
        </div>
        <!-- Mobile Close Button -->
        <button
          @click="closeMobileSidebar"
          class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X class="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4">
      <div class="space-y-2">
        <router-link
          v-for="item in sidebarItems"
          :key="item.id"
          :to="item.href"
          @click="closeMobileSidebar"
          :class="[
            'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
            isActive(item.href) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <!-- User Info -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User class="w-4 h-4 text-gray-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ email }}</p>
          <p class="text-xs text-gray-500">Administrator</p>
        </div>
      </div>
      <button @click="auth.logout" class="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <LogOut class="w-4 h-4" />
        <span class="text-sm font-medium">Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  Users,
  BarChart3,
  User,
  LogOut,
  X,
  UserCircle,
  Mic,
  ClipboardList
} from 'lucide-vue-next'
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
const email = ref("");
const auth = useAuthStore()
watch(() => auth.user, (newUser) => {
  if (newUser) {
    email.value = newUser.email;
  }
}, { immediate: true })
interface Props {
  isMobileSidebarOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  closeMobileSidebar: []
}>()

const route = useRoute()

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "submit-feedback", label: "Submit Feedback", icon: MessageSquare, href: "/dashboard/submit-feedback" },
  { id: "manage-feedback", label: "Manage Feedbacks", icon: ClipboardList, href: "/dashboard/managefeedbacks" },
  { id: "upload-moment", label: "Upload Moment", icon: Upload, href: "/dashboard/upload-moment" },
  { id: "manage-workers", label: "Manage Workers", icon: Users, href: "/dashboard/manage-workers" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { id: "voice-chat", label: "AI Voice Chat", icon: Mic, href: "/dashboard/voice-chat" },
  // { id: "user-dashboard", label: "User Dashboard", icon: UserCircle, href: "/user-dashboard" },
]

const closeMobileSidebar = () => {
  emit('closeMobileSidebar')
}

const isActive = (href: string) => {
  return route.path === href
}
</script>
