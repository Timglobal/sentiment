<template>
  <div class="w-full h-full">
    <Bar
      :data="chartData"
      :options="chartOptions"
      class="max-h-80"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { ChartOptions } from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface DepartmentScoreData {
  department: string
  score: number
  change: number
}

interface Props {
  data: DepartmentScoreData[]
}

const props = defineProps<Props>()

const chartData = computed(() => {
  const labels = props.data.map(item => item.department)
  const scores = props.data.map(item => item.score)
  
  // Color bars based on score: green (8+), yellow (6-8), red (<6)
  const backgroundColors = scores.map(score => {
    if (score >= 8) return 'rgba(34, 197, 94, 0.8)'
    if (score >= 6) return 'rgba(234, 179, 8, 0.8)'
    return 'rgba(239, 68, 68, 0.8)'
  })
  
  const borderColors = scores.map(score => {
    if (score >= 8) return 'rgb(34, 197, 94)'
    if (score >= 6) return 'rgb(234, 179, 8)'
    return 'rgb(239, 68, 68)'
  })

  return {
    labels,
    datasets: [
      {
        label: 'Satisfaction Score',
        data: scores,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
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
          const changeData = props.data[context.dataIndex]
          const changeText = changeData.change >= 0 
            ? `+${changeData.change.toFixed(1)}` 
            : changeData.change.toFixed(1)
          return [
            `Score: ${context.parsed.y.toFixed(1)}/10`,
            `Change: ${changeText}`
          ]
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
        },
        maxRotation: 45
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      max: 10,
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        color: 'rgb(156, 163, 175)',
        font: {
          size: 11
        },
        stepSize: 1,
        callback: function(value) {
          return value + '/10'
        }
      }
    }
  },
  elements: {
    bar: {
      borderWidth: 2
    }
  }
}))
</script>
