<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <UserDashboardSidebar
      :is-mobile-sidebar-open="isMobileSidebarOpen"
      @close="closeMobileSidebar"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
        <button
          @click="toggleMobileSidebar"
          class="-ml-1 p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu class="h-5 w-5 text-gray-600" />
        </button>
        <div class="h-4 w-px bg-gray-200 lg:block hidden"></div>
        <div>
          <h1 class="font-semibold text-gray-900">Timglobal User Dashboard</h1>
        </div>
      </header>
      
      <!-- Content -->
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
      @click="closeMobileSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import UserDashboardSidebar from './UserDashboardSidebar.vue'
import { Menu } from 'lucide-vue-next'

const isMobileSidebarOpen = ref(false)

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
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
