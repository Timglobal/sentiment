<template>
  <div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <MetricCard
      title="Total Feedback"
      :value="realTimeData.metrics.totalFeedback"
      :change="`${realTimeData.metrics.totalFeedback > 2847 ? '+' : ''}${Math.round(((realTimeData.metrics.totalFeedback - 2847) / 2847) * 100 * 10) / 10}%`"
      :changeType="realTimeData.metrics.totalFeedback > 2847 ? 'positive' : 'negative'"
      :icon="MessageSquare"
    />
    <MetricCard
      title="Avg Sentiment Score"
      :value="realTimeData.metrics.avgSentimentScore"
      :change="`${realTimeData.metrics.avgSentimentScore > 7.8 ? '+' : ''}${Math.round((realTimeData.metrics.avgSentimentScore - 7.8) * 10) / 10}`"
      :changeType="realTimeData.metrics.avgSentimentScore > 7.8 ? 'positive' : 'negative'"
      :icon="TrendingUp"
      suffix="/10"
    />
    <MetricCard
      title="Response Rate"
      :value="realTimeData.metrics.responseRate"
      :change="`${realTimeData.metrics.responseRate > 94 ? '+' : ''}${Math.round((realTimeData.metrics.responseRate - 94) * 10) / 10}%`"
      :changeType="realTimeData.metrics.responseRate > 94 ? 'positive' : 'negative'"
      :icon="Activity"
      suffix="%"
    />
    <MetricCard
      title="Avg Response Time"
      :value="realTimeData.metrics.avgResponseTime"
      :change="`${realTimeData.metrics.avgResponseTime < 2.1 ? '-' : '+'}${Math.abs(Math.round((realTimeData.metrics.avgResponseTime - 2.1) * 10) / 10)}`"
      :changeType="realTimeData.metrics.avgResponseTime < 2.1 ? 'positive' : 'negative'"
      :icon="Clock"
      suffix="h"
    />
  </div>
</template>

<script setup lang="ts">
import MetricCard from '@/components/MetricCard.vue'
import { MessageSquare, TrendingUp, Activity, Clock } from 'lucide-vue-next'

interface RealTimeMetrics {
  totalFeedback: number
  avgSentimentScore: number
  responseRate: number
  avgResponseTime: number
}

interface Props {
  realTimeData: {
    metrics: RealTimeMetrics
  }
}

defineProps<Props>()
</script>
