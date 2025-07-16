<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow">
    <h2 class="text-2xl font-bold mb-4">All Assigned Occupants</h2>

    <RouterLink
      v-if="route.query.roomId"
      :to="`/rooms/${route.query.roomId}`"
      class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mt-4 inline-block"
    >
      ⬅ Back to Room Details
    </RouterLink>

    <div v-if="tenants.length === 0" class="text-gray-600">No tenant records yet.</div>
    <table v-else class="w-full border border-gray-300">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2">Name</th>
          <th class="p-2">Room</th>
          <th class="p-2">Type</th>
          <th class="p-2">Start</th>
          <th class="p-2">End</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tenants" :key="t._id" class="border-t">
          <td class="p-2">{{ t.name }}</td>
          <td class="p-2">{{ t.roomType }}</td>
          <td class="p-2">Room {{ t.roomNumber }}</td>
          <td class="p-2">{{ formatDate(t.startTime) }}</td>
          <td class="p-2">{{ formatDate(t.endTime) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { API_BASE_URL } from '@/config'
import { useRoute } from 'vue-router'

const tenants = ref([])
const route = useRoute()

const formatDate = (d) => d ? new Date(d).toLocaleString() : 'N/A'

onMounted(async () => {
  try {
    const roomId = route.query.roomId
    const url = `${API_BASE_URL}/tenants${roomId ? `?roomId=${roomId}` : ''}`
    const res = await fetch(url)

    if (!res.ok) throw new Error('Failed to fetch tenant records')

    tenants.value = await res.json()
  } catch (err) {
    console.error(err)
  }
})

</script>