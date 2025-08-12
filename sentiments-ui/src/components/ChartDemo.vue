<template>
  <div class="p-6 space-y-8">
    <h1 class="text-2xl font-bold text-gray-900">Chart Components Demo</h1>
    
    <!-- Sentiment Trends Chart -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Sentiment Trends Chart (Line/Area)</h2>
      <div class="h-80">
        <SentimentTrendsChart :data="sentimentData" />
      </div>
    </div>

    <!-- Feedback Categories Chart -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Feedback Categories Chart (Doughnut)</h2>
      <div class="h-80">
        <FeedbackCategoriesChart :data="categoryData" />
      </div>
    </div>

    <!-- Department Performance Chart -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Department Performance Chart (Bar)</h2>
      <div class="h-80">
        <DepartmentPerformanceChart :data="departmentData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SentimentTrendsChart from '@/components/charts/SentimentTrendsChart.vue'
import FeedbackCategoriesChart from '@/components/charts/FeedbackCategoriesChart.vue'
import DepartmentPerformanceChart from '@/components/charts/DepartmentPerformanceChart.vue'

// Sample data for demonstration
const sentimentData = ref([
  { date: '2024-01-01', positive: 65, neutral: 25, negative: 10, timestamp: Date.now() },
  { date: '2024-01-02', positive: 70, neutral: 20, negative: 10, timestamp: Date.now() },
  { date: '2024-01-03', positive: 68, neutral: 22, negative: 10, timestamp: Date.now() },
  { date: '2024-01-04', positive: 72, neutral: 18, negative: 10, timestamp: Date.now() },
  { date: '2024-01-05', positive: 75, neutral: 15, negative: 10, timestamp: Date.now() },
  { date: '2024-01-06', positive: 73, neutral: 17, negative: 10, timestamp: Date.now() },
  { date: '2024-01-07', positive: 78, neutral: 12, negative: 10, timestamp: Date.now() }
])

const categoryData = ref([
  { name: 'Customer Service', value: 35, fill: '#3b82f6' },
  { name: 'Product Quality', value: 28, fill: '#10b981' },
  { name: 'Delivery', value: 20, fill: '#f59e0b' },
  { name: 'Pricing', value: 12, fill: '#ef4444' },
  { name: 'Other', value: 5, fill: '#8b5cf6' }
])

const departmentData = ref([
  { department: 'Sales', score: 8.5, change: 0.3 },
  { department: 'Support', score: 9.2, change: 0.5 },
  { department: 'Marketing', score: 7.8, change: -0.2 },
  { department: 'Development', score: 8.9, change: 0.4 },
  { department: 'HR', score: 7.5, change: 0.1 },
  { department: 'Finance', score: 8.1, change: 0.0 }
])
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
