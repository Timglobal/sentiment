<template>
  <div class="space-y-6">
    <!-- Main Charts Row -->
    <div class="grid gap-6 lg:grid-cols-1 xl:grid-cols-2 auto-rows-fr">
      <div class="w-full">
        <ChartCard
          title="Sentiment Analysis Trends"
          subtitle="Real-time sentiment distribution over the last 30 days"
          :isLive="true"
        >
          <template #actions>
            <Badge variant="secondary">Daily</Badge>
          </template>
          <div class="h-80">
            <SentimentTrendsChart :data="realTimeData.sentimentTrends" />
          </div>
        </ChartCard>
      </div>

      <div class="w-full">
        <ChartCard
          title="Feedback Categories"
          subtitle="Live distribution of feedback by category"
          :isLive="true"
        >
          <template #actions>
            <Badge variant="secondary">Current Period</Badge>
          </template>
          <div class="h-80">
            <FeedbackCategoriesChart :data="realTimeData.feedbackCategories" />
          </div>
        </ChartCard>
      </div>
    </div>

    <!-- Department Performance Chart -->
    <div class="grid gap-6">
      <ChartCard
        title="Department Performance Comparison"
        subtitle="Live satisfaction scores across all departments"
        :isLive="true"
      >
        <template #actions>
          <Badge variant="secondary">Score/10</Badge>
        </template>
        <div class="h-80">
          <DepartmentPerformanceChart :data="realTimeData.departmentScores" />
        </div>
      </ChartCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChartCard from '@/components/ChartCard.vue'
import Badge from '@/components/ui/Badge.vue'
import SentimentTrendsChart from '@/components/charts/SentimentTrendsChart.vue'
import FeedbackCategoriesChart from '@/components/charts/FeedbackCategoriesChart.vue'
import DepartmentPerformanceChart from '@/components/charts/DepartmentPerformanceChart.vue'

interface SentimentTrendData {
  date: string
  positive: number
  neutral: number
  negative: number
  timestamp: number
}

interface FeedbackCategoryData {
  name: string
  value: number
  fill: string
}

interface DepartmentScoreData {
  department: string
  score: number
  change: number
}

interface Props {
  realTimeData: {
    sentimentTrends: SentimentTrendData[]
    feedbackCategories: FeedbackCategoryData[]
    departmentScores: DepartmentScoreData[]
  }
}

defineProps<Props>()
</script>
