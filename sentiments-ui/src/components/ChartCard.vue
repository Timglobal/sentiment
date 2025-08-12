<template>
  <Card class="h-full flex flex-col">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
      <div class="space-y-1 min-w-0 flex-1">
        <CardTitle class="text-base font-semibold flex items-center gap-2">
          <span class="truncate">{{ title }}</span>
          <div v-if="isLive && isRealTimeEnabled" class="flex items-center gap-1 flex-shrink-0">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-xs text-green-600 font-normal">Live</span>
          </div>
        </CardTitle>
        <p v-if="subtitle" class="text-sm text-muted-foreground truncate">{{ subtitle }}</p>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0">
        <slot name="actions" />
        <Button variant="ghost" size="sm">
          <MoreHorizontal class="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent class="pt-0 flex-1 min-h-0">
      <slot />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import Button from '@/components/ui/Button.vue'
import { MoreHorizontal } from 'lucide-vue-next'

interface Props {
  title: string
  subtitle?: string
  isLive?: boolean
}

defineProps<Props>()

// Inject isRealTimeEnabled from parent
const isRealTimeEnabled = inject('isRealTimeEnabled', false)
</script>
