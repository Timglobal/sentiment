<template>
  <div>
    <!-- Header -->
    <header class="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2025-07-03_at_21.46.04_48bcdeab_2-removebg-preview%201%20%281%29-qusazhTXS2124OdkpQikqHGGcpQQ8J.png"
            alt="Timglobal Logo"
            class="w-8 h-8"
          />
          <router-link to="/" class="font-bold text-xl">Timglobal</router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link
            to="/"
            :class="[
              'transition-colors',
              isActive('/')
                ? 'text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Home
          </router-link>
          <router-link
            to="/product"
            :class="[
              'transition-colors',
              isActive('/product')
                ? 'text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Product
          </router-link>
          <router-link
            to="/about"
            :class="[
              'transition-colors',
              isActive('/about')
                ? 'text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            About Us
          </router-link>
          <router-link
            to="/contact"
            :class="[
              'transition-colors',
              isActive('/contact')
                ? 'text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Contact
          </router-link>
          <router-link
            to="/careers"
            :class="[
              'transition-colors',
              isActive('/careers')
                ? 'text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Careers
          </router-link>
        </nav>

        <!-- Desktop Login/Signup -->
        <div class="hidden md:flex items-center space-x-4">
          <a href="/login" class="text-gray-600 hover:text-gray-900 transition-colors">
            Login
          </a>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors" @click="goToSignUp">Signup</button>
        </div>

        <!-- Mobile Hamburger Button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors z-50 relative"
          aria-label="Toggle mobile menu"
        >
          <XMarkIcon v-if="isMobileMenuOpen" class="h-6 w-6 text-gray-600" />
          <Bars3Icon v-else class="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </header>

    <!-- Mobile Menu Backdrop -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 md:hidden"
      @click="closeMobileMenu"
      aria-hidden="true"
    />

    <!-- Mobile Navigation Drawer -->
    <div
      :class="[
        'fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Drawer Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div class="flex items-center space-x-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2025-07-03_at_21.46.04_48bcdeab_2-removebg-preview%201%20%281%29-qusazhTXS2124OdkpQikqHGGcpQQ8J.png"
              alt="Timglobal Logo"
              class="w-8 h-8"
            />
            <span class="font-bold text-xl">Timglobal</span>
          </div>
          <button
            @click="closeMobileMenu"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close mobile menu"
          >
            <XMarkIcon class="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <!-- Drawer Content -->
        <div class="flex-1 overflow-y-auto">
          <nav class="p-6">
            <div class="space-y-1">
              <router-link
                to="/"
                :class="[
                  'block transition-colors py-3 px-4 rounded-lg text-lg font-medium',
                  isActive('/about')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                ]"
                @click="closeMobileMenu"
              >
                Home
              </router-link>
              <router-link
                to="/product"
                :class="[
                  'block transition-colors py-3 px-4 rounded-lg text-lg font-medium',
                  isActive('/product')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                ]"
                @click="closeMobileMenu"
              >
                Product
              </router-link>
              <router-link
                to="/about"
                :class="[
                  'block transition-colors py-3 px-4 rounded-lg text-lg font-medium',
                  isActive('/about')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                ]"
                @click="closeMobileMenu"
              >
                About Us
              </router-link>
              <router-link
                to="/contact"
                :class="[
                  'block transition-colors py-3 px-4 rounded-lg text-lg font-medium',
                  isActive('/contact')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                ]"
                @click="closeMobileMenu"
              >
                Contact
              </router-link>
              <router-link
                to="/careers"
                :class="[
                  'block transition-colors py-3 px-4 rounded-lg text-lg font-medium',
                  isActive('/careers')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                ]"
                @click="closeMobileMenu"
              >
                Careers
              </router-link>
            </div>
          </nav>
        </div>

        <!-- Drawer Footer -->
        <div class="p-6 border-t border-gray-100 space-y-4">
          <a
            href="/login"
            class="block text-center text-gray-700 hover:text-blue-600 transition-colors py-3 px-4 rounded-lg text-lg font-medium hover:bg-gray-50"
            @click="closeMobileMenu"
          >
            Login
          </a>
          <button
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-lg transition-colors"
            @click="goToSignUp"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
// Reactive state
const isMobileMenuOpen = ref(false)

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Check if current route is active
const isActive = (path: string) => {
  return route.path === path
}

// Handle escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeMobileMenu()
  }
}

function goToSignUp() {
  router.push('/signup')
}

// Watch for mobile menu changes
const handleBodyScroll = () => {
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'unset'
  }
}

// Setup event listeners
onMounted(() => {
  document.addEventListener('keydown', handleEscape)

  // Watch for menu state changes
  watch(isMobileMenuOpen, () => {
    handleBodyScroll()
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = 'unset'
})

// Watch mobile menu state for body scroll
const unwatchMobileMenu = computed(() => {
  handleBodyScroll()
  return isMobileMenuOpen.value
})
</script>
