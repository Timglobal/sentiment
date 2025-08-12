<template>
  <div class="p-8 max-w-xl mx-auto text-center font-sans">
    <h2 class="text-2xl font-bold mb-4">Room Extension</h2>
    <div v-if="loading">Processing your response...</div>
    <div v-else-if="success" class="text-green-600 font-semibold">{{ success }}</div>
    <div v-else class="text-red-600 font-semibold">{{ error }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL } from '@/config'

const route = useRoute()
const loading = ref(true)
const success = ref('')
const error = ref('')

onMounted(async () => {
  const roomId = route.params.roomId
  const decision = route.query.decision

  if (!roomId || !decision) {
    error.value = 'Invalid link.'
    loading.value = false
    return
  }

   try {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/extend`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.message || 'Extension failed')
    success.value = data.message
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
