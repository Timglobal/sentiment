import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'

// Define types for real-time data
export interface SentimentTrendData {
  date: string
  positive: number
  neutral: number
  negative: number
  timestamp: number
}

export interface FeedbackCategoryData {
  name: string
  value: number
  fill: string
}

export interface DepartmentScoreData {
  department: string
  score: number
  change: number
}

export interface RealTimeData {
  sentimentTrends: SentimentTrendData[]
  feedbackCategories: FeedbackCategoryData[]
  departmentScores: DepartmentScoreData[]
  metrics: {
    totalFeedback: number
    avgSentimentScore: number
    responseRate: number
    avgResponseTime: number
  }
}

export interface AnalyticsTableRow {
  metric: string
  current: string
  previous: string
  change: string
  trend: 'up' | 'down'
  status: 'excellent' | 'good' | 'warning'
}

export function useAnalyticsData() {
  // State management
  const selectedWorker = ref("all")
  const selectedTimeRange = ref("30d")
  const selectedDepartment = ref("all")
  const isRealTimeEnabled = ref(true)
  const lastUpdated = ref(new Date())
  const animationSpeed = ref("normal")
  const chartType = ref({
    sentiment: "area",
    engagement: "bar",
    response: "horizontal-bar",
    department: "line",
    feedback: "pie"
  })

  // Enhanced real-time state
  const dataUpdateTrigger = ref(0)
  const isUpdating = ref(false)
  const isMobile = ref(false)

  const realTimeData = ref<RealTimeData>({
    sentimentTrends: [],
    feedbackCategories: [],
    departmentScores: [],
    metrics: {
      totalFeedback: 2847,
      avgSentimentScore: 7.8,
      responseRate: 94,
      avgResponseTime: 2.1,
    },
  })

  // Mock data
  const workers = [
    { id: "all", name: "All Workers", department: "All" },
    { id: 1, name: "Dr. John Smith", role: "Senior Physician", department: "Emergency" },
    { id: 2, name: "Sarah Johnson", role: "Head Nurse", department: "Cardiology" },
    { id: 3, name: "Mike Wilson", role: "Lead Technician", department: "Radiology" },
    { id: 4, name: "Dr. Emily Davis", role: "Department Head", department: "Administration" },
    { id: 5, name: "David Brown", role: "Staff Nurse", department: "Pediatrics" },
  ]

  const departments = [
    { id: "all", name: "All Departments" },
    { id: "emergency", name: "Emergency" },
    { id: "cardiology", name: "Cardiology" },
    { id: "radiology", name: "Radiology" },
    { id: "pediatrics", name: "Pediatrics" },
    { id: "administration", name: "Administration" },
  ]

  // Computed values
  const selectedWorkerName = computed(() => {
    const worker = workers.find((w) => w.id == selectedWorker.value)
    return worker?.name || "All Workers"
  })

  // Enhanced data generation functions
  const generateSentimentTrendsData = (): SentimentTrendData[] => {
    const now = new Date()
    const data: SentimentTrendData[] = []
    const timeOfDay = now.getHours()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // More realistic patterns based on day of week and time
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const weekendMultiplier = isWeekend ? 0.8 : 1.0
      
      // Time-based variations
      const timeMultiplier = 1 + 0.1 * Math.sin((timeOfDay / 24) * 2 * Math.PI)
      
      // Base sentiment with realistic workplace patterns
      let basePositive = 75 + Math.sin(i * 0.1) * 8 + (Math.random() - 0.5) * 6
      let baseNeutral = 18 + (Math.random() - 0.5) * 4
      let baseNegative = 7 + (Math.random() - 0.5) * 2
      
      // Apply modifiers
      basePositive *= weekendMultiplier * timeMultiplier
      baseNeutral *= (1 + (1 - weekendMultiplier) * 0.5)
      baseNegative *= (isWeekend ? 0.7 : 1.1)
      
      // Normalize to 100%
      const total = basePositive + baseNeutral + baseNegative
      
      data.push({
        date: date.toISOString().split('T')[0],
        positive: Math.round((basePositive / total) * 100 * 10) / 10,
        neutral: Math.round((baseNeutral / total) * 100 * 10) / 10,
        negative: Math.round((baseNegative / total) * 100 * 10) / 10,
        timestamp: date.getTime(),
      })
    }
    return data
  }

  const generateFeedbackCategoriesData = (): FeedbackCategoryData[] => {
    const hour = new Date().getHours()
    const trendingFactor = Math.sin(hour / 24 * 2 * Math.PI) * 0.2 + 1
    
    const categories: FeedbackCategoryData[] = [
      { 
        name: "Work Environment", 
        value: Math.round((35 + Math.sin(dataUpdateTrigger.value * 0.1) * 5) * trendingFactor), 
        fill: "hsl(var(--chart-1))" 
      },
      { 
        name: "Team Collaboration", 
        value: Math.round((25 + Math.cos(dataUpdateTrigger.value * 0.15) * 4) * trendingFactor), 
        fill: "hsl(var(--chart-2))" 
      },
      { 
        name: "Management", 
        value: Math.round((20 + Math.sin(dataUpdateTrigger.value * 0.08) * 3) * trendingFactor), 
        fill: "hsl(var(--chart-3))" 
      },
      { 
        name: "Resources", 
        value: Math.round((12 + Math.cos(dataUpdateTrigger.value * 0.12) * 2) * trendingFactor), 
        fill: "hsl(var(--chart-4))" 
      },
      { 
        name: "Other", 
        value: Math.round((8 + Math.sin(dataUpdateTrigger.value * 0.2) * 1.5) * trendingFactor), 
        fill: "hsl(var(--chart-5))" 
      },
    ]
    
    // Normalize values
    const total = categories.reduce((sum, cat) => sum + cat.value, 0)
    return categories.map(cat => ({ ...cat, value: Math.round((cat.value / total) * 100) }))
  }

  const generateDepartmentScores = (): DepartmentScoreData[] => {
    const departmentList = ["Emergency", "Cardiology", "Radiology", "Pediatrics", "Administration"]
    return departmentList.map((dept, index) => {
      const baseScore = 8.0 + (index * 0.1) + Math.random() * 1.5
      const trendVariation = Math.sin((dataUpdateTrigger.value + index) * 0.1) * 0.3
      
      return {
        department: dept,
        score: Math.round((baseScore + trendVariation) * 10) / 10,
        change: Math.round((Math.random() - 0.5) * 0.6 * 10) / 10,
      }
    })
  }

  // Analytics data computation
  const getAnalyticsData = () => {
    const baseMultiplier = isRealTimeEnabled.value ? (0.95 + Math.random() * 0.1) : 1
    const timeMultiplier = Math.sin(Date.now() / 10000) * 0.05 + 1
    
    if (selectedWorker.value === "all") {
      return {
        totalFeedback: Math.round(1247 * baseMultiplier * timeMultiplier),
        positiveSentiment: Math.round((78.4 + (Math.random() - 0.5) * 3) * 10) / 10,
        neutralSentiment: Math.round((15.2 + (Math.random() - 0.5) * 2) * 10) / 10,
        negativeSentiment: Math.round((6.4 + (Math.random() - 0.5) * 1) * 10) / 10,
        engagementScore: Math.round((85.7 + (Math.random() - 0.5) * 4) * 10) / 10,
        responseRate: Math.round((92.3 + (Math.random() - 0.5) * 2) * 10) / 10,
        averageRating: Math.round((4.2 + (Math.random() - 0.5) * 0.4) * 10) / 10,
        momentsShared: Math.round(156 * baseMultiplier),
        activeUsers: Math.round(89 * baseMultiplier),
        completionRate: Math.round((94.1 + (Math.random() - 0.5) * 2) * 10) / 10,
        averageResponseTime: Math.round((2.4 + (Math.random() - 0.5) * 0.6) * 10) / 10,
        satisfactionScore: Math.round((8.7 + (Math.random() - 0.5) * 0.6) * 10) / 10,
      }
    } else {
      return {
        totalFeedback: Math.round(47 * baseMultiplier * timeMultiplier),
        positiveSentiment: Math.round((83.2 + (Math.random() - 0.5) * 3) * 10) / 10,
        neutralSentiment: Math.round((10.6 + (Math.random() - 0.5) * 2) * 10) / 10,
        negativeSentiment: Math.round((6.2 + (Math.random() - 0.5) * 1) * 10) / 10,
        engagementScore: Math.round((88.9 + (Math.random() - 0.5) * 4) * 10) / 10,
        responseRate: Math.round((95.7 + (Math.random() - 0.5) * 2) * 10) / 10,
        averageRating: Math.round((4.5 + (Math.random() - 0.5) * 0.3) * 10) / 10,
        momentsShared: Math.round(12 * baseMultiplier),
        activeUsers: 1,
        completionRate: Math.round((96.8 + (Math.random() - 0.5) * 2) * 10) / 10,
        averageResponseTime: Math.round((1.8 + (Math.random() - 0.5) * 0.4) * 10) / 10,
        satisfactionScore: Math.round((9.1 + (Math.random() - 0.5) * 0.4) * 10) / 10,
      }
    }
  }

  const analyticsData = computed(() => getAnalyticsData())

  const analyticsTableData = computed((): AnalyticsTableRow[] => [
    {
      metric: "Total Feedback Submissions",
      current: analyticsData.value.totalFeedback.toLocaleString(),
      previous: "1,112",
      change: "+12.1%",
      trend: "up",
      status: "excellent",
    },
    {
      metric: "Positive Sentiment Rate",
      current: `${analyticsData.value.positiveSentiment}%`,
      previous: "74.2%",
      change: "+5.7%",
      trend: "up",
      status: "good",
    },
    {
      metric: "Employee Engagement Score",
      current: `${analyticsData.value.engagementScore}%`,
      previous: "87.6%",
      change: "-2.2%",
      trend: "down",
      status: "warning",
    },
    {
      metric: "Response Rate",
      current: `${analyticsData.value.responseRate}%`,
      previous: "89.1%",
      change: "+3.6%",
      trend: "up",
      status: "excellent",
    },
    {
      metric: "Average Satisfaction Score",
      current: `${analyticsData.value.satisfactionScore}/10`,
      previous: "8.4/10",
      change: "+3.6%",
      trend: "up",
      status: "excellent",
    },
    {
      metric: "Completion Rate",
      current: `${analyticsData.value.completionRate}%`,
      previous: "92.3%",
      change: "+1.9%",
      trend: "up",
      status: "good",
    },
  ])

  // Methods
  const updateRealTimeData = () => {
    isUpdating.value = true
    
    setTimeout(() => {
      realTimeData.value = {
        sentimentTrends: generateSentimentTrendsData(),
        feedbackCategories: generateFeedbackCategoriesData(),
        departmentScores: generateDepartmentScores(),
        metrics: {
          totalFeedback: realTimeData.value.metrics.totalFeedback + Math.round((Math.random() - 0.5) * 10),
          avgSentimentScore: Math.max(1, Math.min(10, 
            realTimeData.value.metrics.avgSentimentScore + (Math.random() - 0.5) * 0.2
          )),
          responseRate: Math.max(80, Math.min(100, 
            realTimeData.value.metrics.responseRate + (Math.random() - 0.5) * 2
          )),
          avgResponseTime: Math.max(1, Math.min(5, 
            realTimeData.value.metrics.avgResponseTime + (Math.random() - 0.5) * 0.1
          )),
        },
      }
      
      isUpdating.value = false
    }, 200)
    
    lastUpdated.value = new Date()
  }

  const getAnimationInterval = (speed: string) => {
    switch (speed) {
      case "slow": return 8000
      case "normal": return 5000
      case "fast": return 2000
      default: return 5000
    }
  }

  const toggleRealTime = () => {
    isRealTimeEnabled.value = !isRealTimeEnabled.value
  }

  const triggerManualUpdate = () => {
    dataUpdateTrigger.value += 1
    updateRealTimeData()
  }

  const toggleChartType = (chartKey: string) => {
    if (chartKey === 'sentiment') {
      chartType.value.sentiment = chartType.value.sentiment === 'area' ? 'line' : 'area'
    } else if (chartKey === 'feedback') {
      chartType.value.feedback = chartType.value.feedback === 'pie' ? 'donut' : 'pie'
    }
  }

  const exportData = () => {
    // Export functionality placeholder
    console.log('Exporting analytics data...')
  }

  // Handle responsive design
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768
  }

  // Lifecycle management
  const initializeAnalytics = () => {
    handleResize()
    window.addEventListener('resize', handleResize)
    updateRealTimeData()
  }

  const cleanupAnalytics = () => {
    window.removeEventListener('resize', handleResize)
  }

  // Real-time data updates
  let intervalId: number | null = null

  const setupRealTimeUpdates = () => {
    watchEffect(() => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      
      if (isRealTimeEnabled.value) {
        intervalId = setInterval(updateRealTimeData, getAnimationInterval(animationSpeed.value))
      }
    })
  }

  return {
    // State
    selectedWorker,
    selectedTimeRange,
    selectedDepartment,
    isRealTimeEnabled,
    lastUpdated,
    animationSpeed,
    chartType,
    dataUpdateTrigger,
    isUpdating,
    isMobile,
    realTimeData,
    
    // Data
    workers,
    departments,
    
    // Computed
    selectedWorkerName,
    analyticsData,
    analyticsTableData,
    
    // Methods
    updateRealTimeData,
    toggleRealTime,
    triggerManualUpdate,
    toggleChartType,
    exportData,
    initializeAnalytics,
    cleanupAnalytics,
    setupRealTimeUpdates,
  }
}
