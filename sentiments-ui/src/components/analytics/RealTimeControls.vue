<template>
  <Card v-if="isRealTimeEnabled" class="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
    <div class="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="toggleRealTime"
            class="flex items-center gap-2"
          >
            <Pause v-if="isRealTimeEnabled" class="w-4 h-4" />
            <Play v-else class="w-4 h-4" />
            {{ isRealTimeEnabled ? "Pause" : "Resume" }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="triggerManualUpdate"
            :disabled="isUpdating"
            class="flex items-center gap-2"
          >
            <RefreshCw :class="`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`" />
            <span class="hidden sm:inline">Update Now</span>
            <span class="sm:hidden">Update</span>
          </Button>
        </div>
        
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <Zap class="w-4 h-4" />
            <span>Speed:</span>
          </div>
          <div class="flex gap-1">
            <Button
              v-for="speed in ['slow', 'normal', 'fast']"
              :key="speed"
              :variant="animationSpeed === speed ? 'default' : 'outline'"
              size="sm"
              @click="updateAnimationSpeed(speed)"
              class="px-2 py-1 text-xs capitalize"
            >
              {{ speed }}
            </Button>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex items-center gap-2 text-sm">
          <div :class="`w-2 h-2 rounded-full ${isUpdating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`" />
          <span class="text-muted-foreground">
            {{ isUpdating ? "Updating..." : "Live Data Active" }}
          </span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <span class="text-sm text-muted-foreground whitespace-nowrap">Chart Type:</span>
          <div class="flex gap-1">
            <Button
              :variant="chartType.sentiment === 'area' ? 'default' : 'outline'"
              size="sm"
              @click="toggleChartType('sentiment')"
              class="px-2 py-1 text-xs"
              title="Toggle Sentiment Chart Type"
            >
              <AreaChart class="w-3 h-3" />
            </Button>
            <Button
              :variant="chartType.feedback === 'pie' ? 'default' : 'outline'"
              size="sm"
              @click="toggleChartType('feedback')"
              class="px-2 py-1 text-xs"
              title="Toggle Feedback Chart Type"
            >
              <PieChartIcon class="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { RefreshCw, Pause, Play, Zap, AreaChart, PieChart as PieChartIcon } from 'lucide-vue-next'

interface Props {
  isRealTimeEnabled: boolean
  isUpdating: boolean
  animationSpeed: string
  chartType: {
    sentiment: string
    feedback: string
  }
}

interface Emits {
  'toggle-real-time': []
  'trigger-manual-update': []
  'update:animationSpeed': [value: string]
  'toggle-chart-type': [chartKey: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleRealTime = () => {
  emit('toggle-real-time')
}

const triggerManualUpdate = () => {
  emit('trigger-manual-update')
}

const updateAnimationSpeed = (speed: string) => {
  emit('update:animationSpeed', speed)
}

const toggleChartType = (chartKey: string) => {
  emit('toggle-chart-type', chartKey)
}
</script>
