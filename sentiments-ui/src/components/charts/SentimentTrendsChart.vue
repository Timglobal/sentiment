<template>
  <div class="w-full h-full">
    <Line
      :data="chartData"
      :options="chartOptions"
      class="max-h-80"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { ChartOptions } from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface SentimentTrendData {
  date: string
  positive: number
  neutral: number
  negative: number
  timestamp: number
}

interface Props {
  data: SentimentTrendData[]
}

const props = defineProps<Props>()

const chartData = computed(() => {
  const labels = props.data.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  return {
    labels,
    datasets: [
      {
        label: 'Positive',
        data: props.data.map(item => item.positive),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Neutral',
        data: props.data.map(item => item.neutral),
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Negative',
        data: props.data.map(item => item.negative),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        color: 'rgb(156, 163, 175)',
        font: {
          size: 11
        }
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      max: 100,
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        color: 'rgb(156, 163, 175)',
        font: {
          size: 11
        },
        callback: function(value) {
          return value + '%'
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6
    }
  }
}))
</script>
