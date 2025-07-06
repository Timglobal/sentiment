<template>
  <div class="max-w-5xl mx-auto p-6">
    <button
        @click="runAnalysis"
        class="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
        🧠 Run AI Analysis
    </button>

    <h2 class="text-3xl font-bold text-green-700 mb-6">📊 Staff Analysis Dashboard</h2>

    <div v-if="analyses.length === 0" class="text-gray-600">No analysis data yet.</div>

    <div v-for="entry in analyses" :key="entry.workerId._id" class="bg-white shadow rounded-xl p-5 mb-5 border border-gray-200">
      <h3 class="text-xl font-semibold text-blue-800">{{ entry.workerId.name }} ({{ entry.workerId.role }})</h3>

      <div class="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700">
        <div><strong>Sentiment Score:</strong> {{ entry.sentimentScore }}%</div>
        <div><strong>Risk Level:</strong> 
          <span :class="riskColor(entry.riskLevel)">
            {{ entry.riskLevel }}
          </span>
        </div>
        <div><strong>Trend:</strong> 📈 {{ entry.trend }}</div>
        <div><strong>Last Analysis:</strong> {{ new Date(entry.lastAnalysis).toLocaleDateString() }}</div>
      </div>

      <div class="mt-4 text-sm text-gray-700">
        <p><strong>📌 Feedback Count:</strong> {{ entry.stats.feedbackCount }}</p>
        <p><strong>🎥 Moment Count:</strong> {{ entry.stats.momentCount }}</p>
        <p><strong>🎬 Video Count:</strong> {{ entry.stats.videoCount }}</p>
        <p><strong>📝 Keywords:</strong> <span v-if="entry.stats.keywordSummary?.length">{{ entry.stats.keywordSummary.join(', ') }}</span><span v-else>-</span></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toastification'

const analyses = ref<any[]>([])
const toast = useToast()

function riskColor(level: string) {
  if (level === 'high') return 'text-red-600 font-bold'
  if (level === 'medium') return 'text-yellow-600 font-semibold'
  return 'text-green-600 font-semibold'
}

async function fetchAnalysis() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE_URL}/analysis`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!res.ok) throw new Error('Failed to fetch analysis data')
    analyses.value = await res.json()
  } catch (err: any) {
    toast.error(err.message || 'Error fetching analysis data')
  }
}

async function runAnalysis() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE_URL}/analysis/run`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!res.ok) throw new Error('Failed to run analysis')
    toast.success('✅ Analysis completed')
    fetchAnalysis()
  } catch (err: any) {
    toast.error(err.message || 'Error running analysis')
  }
}


onMounted(() => {
  fetchAnalysis()
  runAnalysis()
})
</script>
