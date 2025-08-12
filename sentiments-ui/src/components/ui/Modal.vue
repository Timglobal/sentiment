<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Background overlay -->
      <div
        class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="close"
          aria-hidden="true"
        ></div>

        <!-- Modal panel -->
        <div
          :class="[
            'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all',
            'sm:my-8 sm:w-full',
            sizeClasses
          ]"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  v-if="iconClass"
                  :class="[
                    'mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10',
                    iconClass
                  ]"
                >
                  <component :is="icon" class="h-6 w-6" aria-hidden="true" />
                </div>
                <div class="ml-4 text-center sm:ml-0 sm:text-left">
                  <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                    <slot name="header">{{ title }}</slot>
                  </h3>
                </div>
              </div>
              <button
                type="button"
                class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                @click="close"
              >
                <span class="sr-only">Close</span>
                <X class="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  icon?: any
  iconClass?: string
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlayClick: true
})

const emit = defineEmits<{
  close: []
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'sm:max-w-lg',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-5xl',
    '2xl': 'sm:max-w-7xl'
  }
  return sizes[props.size]
})

const close = () => {
  if (props.closeOnOverlayClick) {
    emit('close')
  }
}

// Prevent body scroll when modal is open
watchEffect(() => {
  if (props.isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'unset'
  }
})

// Handle escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

// Add/remove escape key listener
watchEffect(() => {
  if (props.isOpen) {
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('keydown', handleEscape)
  }
})
</script>
