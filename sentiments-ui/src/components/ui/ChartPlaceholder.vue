<template>
  <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
    <div class="text-center">
      <component 
        :is="iconComponent" 
        class="w-12 h-12 text-gray-400 mx-auto mb-2" 
      />
      <p class="text-gray-500 text-sm">{{ title }} chart placeholder</p>
      <p class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AreaChart, BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-vue-next'

interface Props {
  type?: 'area' | 'line' | 'bar' | 'pie' | 'trend'
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'area',
  title: 'Chart',
  subtitle: 'Data visualization would appear here'
})

const iconComponent = computed(() => {
  switch (props.type) {
    case 'area':
      return AreaChart
    case 'line':
      return LineChart
    case 'bar':
      return BarChart3
    case 'pie':
      return PieChart
    case 'trend':
      return TrendingUp
    default:
      return AreaChart
  }
})
</script>
