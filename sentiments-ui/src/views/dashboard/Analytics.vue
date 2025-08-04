<template>
  <DashboardLayout>
    <div class="space-y-6 md:space-y-8">
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
import { useAnalyticsData } from '@/composables/useAnalyticsData'

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
