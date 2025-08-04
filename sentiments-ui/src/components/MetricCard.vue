<template>
  <Card class="relative overflow-hidden">
    <CardContent class="p-6">
      <div class="flex items-center justify-between">
        <div class="space-y-2">
          <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
          <div class="flex items-baseline space-x-2">
            <p class="text-2xl font-bold tracking-tight">
              {{ prefix }}{{ typeof value === "number" ? value.toLocaleString() : value }}{{ suffix }}
            </p>
            <div
              v-if="change"
              :class="`flex items-center space-x-1 text-xs font-medium ${
                changeType === 'positive'
                  ? 'text-emerald-600'
                  : changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`"
            >
              <TrendingUp v-if="changeType === 'positive'" class="w-3 h-3" />
              <TrendingDown v-else-if="changeType === 'negative'" class="w-3 h-3" />
              <span>{{ change }}</span>
            </div>
          </div>
        </div>
        <div
          :class="`p-3 rounded-full ${
            changeType === 'positive'
              ? 'bg-emerald-50 text-emerald-600'
              : changeType === 'negative'
                ? 'bg-red-50 text-red-600'
                : 'bg-blue-50 text-blue-600'
          }`"
        >
          <component :is="icon" class="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

interface MetricCardProps {
  title: string
  value: number | string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: any
  suffix?: string
  prefix?: string
}

defineProps<MetricCardProps>()
</script>
