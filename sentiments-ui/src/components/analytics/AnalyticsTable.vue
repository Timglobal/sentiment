<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle class="text-lg">Performance Metrics Overview</CardTitle>
          <p class="text-sm text-muted-foreground mt-1">Detailed breakdown of key performance indicators</p>
        </div>
        <Badge variant="outline" class="font-normal w-fit">
          {{ selectedWorkerName }}
        </Badge>
      </div>
    </CardHeader>
    <CardContent class="p-0 sm:p-6">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-3 sm:py-4 sm:px-2 font-semibold text-muted-foreground text-sm">Metric</th>
              <th class="text-right py-3 px-3 sm:py-4 sm:px-2 font-semibold text-muted-foreground text-sm">Current</th>
              <th class="text-right py-3 px-3 sm:py-4 sm:px-2 font-semibold text-muted-foreground text-sm hidden sm:table-cell">Previous</th>
              <th class="text-right py-3 px-3 sm:py-4 sm:px-2 font-semibold text-muted-foreground text-sm">Change</th>
              <th class="text-center py-3 px-3 sm:py-4 sm:px-2 font-semibold text-muted-foreground text-sm">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr 
              v-for="(row, index) in analyticsTableData" 
              :key="index"
              class="hover:bg-muted/50 transition-colors"
            >
              <td class="py-3 px-3 sm:py-4 sm:px-2 font-medium text-sm">
                <div class="truncate max-w-[120px] sm:max-w-none" :title="row.metric">
                  {{ isMobile ? row.metric.split(' ').slice(0, 2).join(' ') : row.metric }}
                </div>
              </td>
              <td class="py-3 px-3 sm:py-4 sm:px-2 text-right font-semibold text-sm">{{ row.current }}</td>
              <td class="py-3 px-3 sm:py-4 sm:px-2 text-right text-muted-foreground text-sm hidden sm:table-cell">{{ row.previous }}</td>
              <td
                :class="`py-3 px-3 sm:py-4 sm:px-2 text-right font-medium text-sm ${
                  row.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`"
              >
                <div class="flex items-center justify-end space-x-1">
                  <TrendingUp v-if="row.trend === 'up'" class="w-3 h-3 sm:w-4 sm:h-4" />
                  <TrendingDown v-else class="w-3 h-3 sm:w-4 sm:h-4" />
                  <span class="text-xs sm:text-sm">{{ row.change }}</span>
                </div>
              </td>
              <td class="py-3 px-3 sm:py-4 sm:px-2 text-center">
                <Badge
                  :variant="
                    row.status === 'excellent' ? 'default' : row.status === 'good' ? 'secondary' : 'destructive'
                  "
                  :class="`text-xs ${
                    row.status === 'excellent'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                      : row.status === 'good'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                  }`"
                >
                  <span class="hidden sm:inline">
                    {{ row.status === 'excellent' ? 'Excellent' : row.status === 'good' ? 'Good' : 'Needs Attention' }}
                  </span>
                  <span class="sm:hidden">
                    {{ row.status === 'excellent' ? 'Exc' : row.status === 'good' ? 'Good' : 'Warn' }}
                  </span>
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import Badge from '@/components/ui/Badge.vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

interface AnalyticsTableRow {
  metric: string
  current: string
  previous: string
  change: string
  trend: 'up' | 'down'
  status: 'excellent' | 'good' | 'warning'
}

interface Props {
  analyticsTableData: AnalyticsTableRow[]
  selectedWorkerName: string
  isMobile: boolean
}

defineProps<Props>()
</script>
