<template>
  <div class="relative" ref="selectRef">
    <button
      @click="toggleDropdown"
      :class="[
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      ]"
      :disabled="disabled"
    >
      <span class="flex items-center">
        <slot name="icon" />
        <span class="truncate">{{ displayValue || placeholder }}</span>
      </span>
      <ChevronDown 
        :class="[
          'h-4 w-4 opacity-50 transition-transform duration-200',
          isOpen ? 'rotate-180' : ''
        ]" 
      />
    </button>
    
    <Teleport to="body">
      <div
        v-if="isOpen"
        :style="dropdownStyle"
        class="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      >
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

interface Emits {
  'update:modelValue': [value: string]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select...'
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement>()
const dropdownStyle = ref({})

const displayValue = computed(() => {
  // This will be set by the parent component or SelectItem
  return props.modelValue
})

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

const updateDropdownPosition = () => {
  if (!selectRef.value) return
  
  const rect = selectRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const spaceBelow = viewportHeight - rect.bottom
  const spaceAbove = rect.top
  
  const dropdownHeight = 200 // Approximate max height
  const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
  
  dropdownStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    ...(shouldOpenUpward
      ? { bottom: `${viewportHeight - rect.top}px` }
      : { top: `${rect.bottom}px` }
    )
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
})

// Expose methods for child components
defineExpose({
  closeDropdown,
  updateValue: (value: string) => {
    emit('update:modelValue', value)
    closeDropdown()
  }
})
</script>
