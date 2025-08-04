<template>
  <DashboardLayout>
    <div class="space-y-6 md:space-y-8">
      <!-- Loading State -->
      <div v-if="isLoading && !realTimeData.sentimentTrends.length" class="flex items-center justify-center p-8">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading analytics data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Failed to load analytics data</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="loadAnalyticsData"
              class="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Analytics Content -->
      <div v-else>
        <!-- Header Section -->
        <AnalyticsHeader
          :isRealTimeEnabled="isRealTimeEnabled"
          :selectedWorkerName="selectedWorkerName"
          :selectedDepartment="selectedDepartment"
          :selectedWorker="selectedWorker"
          :selectedTimeRange="selectedTimeRange"
          :lastUpdated="lastUpdated"
          :workers="workers"
          :departments="departments"
          @update:selectedDepartment="selectedDepartment = $event"
          @update:selectedWorker="selectedWorker = $event"
          @update:selectedTimeRange="selectedTimeRange = $event"
          @toggle-real-time="toggleRealTime"
          @export-data="exportData"
        />

        <!-- Enhanced Real-time Controls -->
        <RealTimeControls
          :isRealTimeEnabled="isRealTimeEnabled"
          :isUpdating="isUpdating"
          :animationSpeed="animationSpeed"
          :chartType="chartType"
          @toggle-real-time="toggleRealTime"
          @trigger-manual-update="triggerManualUpdate"
          @update:animationSpeed="animationSpeed = $event"
          @toggle-chart-type="toggleChartType"
        />

        <!-- Key Performance Indicators -->
        <MetricsGrid :realTimeData="realTimeData" />

        <!-- Charts Section -->
        <ChartsSection :realTimeData="realTimeData" />

        <!-- Detailed Analytics Table -->
        <AnalyticsTable
          :analyticsTableData="analyticsTableData"
          :selectedWorkerName="selectedWorkerName"
          :isMobile="isMobile"
        />
      </div>
    </div>
  </DashboardLayout>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, provide } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader.vue'
import RealTimeControls from '@/components/analytics/RealTimeControls.vue'
import MetricsGrid from '@/components/analytics/MetricsGrid.vue'
import ChartsSection from '@/components/analytics/ChartsSection.vue'
import AnalyticsTable from '@/components/analytics/AnalyticsTable.vue'
import { useAnalyticsData } from '@/composables/useAnalyticsDataReal'

// Use the analytics composable
const {
  // State
  selectedWorker,
  selectedTimeRange,
  selectedDepartment,
  isRealTimeEnabled,
  lastUpdated,
  animationSpeed,
  chartType,
  isUpdating,
  isMobile,
  realTimeData,

  // API state
  isLoading,
  error,

  // Data
  workers,
  departments,

  // Computed
  selectedWorkerName,
  analyticsTableData,

  // Methods
  toggleRealTime,
  triggerManualUpdate,
  toggleChartType,
  exportData,
  initializeAnalytics,
  cleanupAnalytics,
  setupRealTimeUpdates,
  loadAnalyticsData,
} = useAnalyticsData()

// Provide isRealTimeEnabled to child components
provide('isRealTimeEnabled', isRealTimeEnabled)

// Lifecycle hooks
onMounted(() => {
  initializeAnalytics()
  setupRealTimeUpdates()
})

onUnmounted(() => {
  cleanupAnalytics()
})
</script>
