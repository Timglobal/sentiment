<template>
  <div style="max-width: 1024px; margin: 3rem auto; padding: 0 1rem;">

    <!-- Run Analysis Button -->
    <button
      @click="runAnalysis"
      style="
        background-color: #10B981;
        color: white;
        padding: 0.75rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.95rem;
        margin-bottom: 2rem;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
      "
    >
      🧠 Run AI Analysis
    </button>

    <!-- Page Heading -->
    <h2 style="font-size: 1.75rem; font-weight: 700; color: #047857; margin-bottom: 2rem;">
      📊 Staff Analysis Dashboard
    </h2>

    <div v-if="analyses.length === 0" style="color: #6B7280;">No analysis data yet.</div>

    <!-- Analysis Cards -->
    <div v-for="entry in analyses" :key="entry.workerId._id"
      style="background: white; border: 1px solid #E5E7EB; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem;">

      <!-- Staff Name -->
      <h3 style="font-size: 1.25rem; font-weight: 600; color: #1D4ED8; margin-bottom: 1rem;">
        {{ entry.workerId.name }} ({{ entry.workerId.role }})
      </h3>

      <!-- Core Stats -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; font-size: 0.95rem; color: #374151;">
        <div><strong>Sentiment Score:</strong> {{ entry.sentimentScore }}%</div>
        <div><strong>Risk Level:</strong> <span :class="riskColor(entry.riskLevel)">{{ entry.riskLevel }}</span></div>
        <div><strong>Trend:</strong> 📈 {{ entry.trend }}</div>
        <div><strong>Last Analysis:</strong> {{ new Date(entry.lastAnalysis).toLocaleDateString() }}</div>
      </div>

      <!-- Breakdown Stats -->
      <div style="margin-top: 1.5rem; font-size: 0.95rem; color: #374151;">
        <p><strong>📌 Feedback Count:</strong> {{ entry.stats.feedbackCount }}</p>
        <p><strong>🎥 Moment Count:</strong> {{ entry.stats.momentCount }}</p>
        <p><strong>🎬 Video Count:</strong> {{ entry.stats.videoCount }}</p>
        <p><strong>📝 Keywords:</strong> 
          <span v-if="entry.stats.keywordSummary?.length">{{ entry.stats.keywordSummary.join(', ') }}</span>
          <span v-else>-</span>
        </p>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toast-notification'

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
