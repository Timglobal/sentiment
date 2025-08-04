<template>
  <div class="w-full h-full">
    <Doughnut
      :data="chartData"
      :options="chartOptions"
      class="max-h-80"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import type { ChartOptions } from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface FeedbackCategoryData {
  name: string
  value: number
  fill: string
}

interface Props {
  data: FeedbackCategoryData[]
}

const props = defineProps<Props>()

const chartData = computed(() => {
  const labels = props.data.map(item => item.name)
  const data = props.data.map(item => item.value)
  const backgroundColor = props.data.map(item => item.fill)

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: backgroundColor.map(color => color),
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        },
        generateLabels: function(chart) {
          const data = chart.data
          if (data.labels && data.datasets.length) {
            return data.labels.map((label, i) => {
              const dataset = data.datasets[0]
              const value = dataset.data[i] as number
              const total = (dataset.data as number[]).reduce((sum, val) => sum + val, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              
              const backgroundColor = Array.isArray(dataset.backgroundColor) 
                ? dataset.backgroundColor[i] as string 
                : dataset.backgroundColor as string
              const borderColor = Array.isArray(dataset.borderColor) 
                ? dataset.borderColor[i] as string 
                : dataset.borderColor as string
              
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: backgroundColor,
                strokeStyle: borderColor,
                lineWidth: 2,
                hidden: false,
                index: i,
                pointStyle: 'circle'
              }
            })
          }
          return []
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          const total = (context.dataset.data as number[]).reduce((sum, val) => sum + val, 0)
          const percentage = ((context.parsed / total) * 100).toFixed(1)
          return `${context.label}: ${context.parsed} (${percentage}%)`
        }
      }
    }
  },
  cutout: '50%',
  elements: {
    arc: {
      borderWidth: 2
    }
  }
}))
</script>
