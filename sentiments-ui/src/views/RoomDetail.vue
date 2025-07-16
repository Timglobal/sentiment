<template>
  <div class="p-6 max-w-3xl mx-auto bg-white rounded font-sans mt-6 border border-gray-200">
    <div v-if="room">
      <!-- Room Image -->
      <img
        v-if="room.imagePath"
        :src="`${STATIC_BASE_URL}${room.imagePath}`"
        alt="Room Image"
        class="w-full h-64 object-cover rounded mb-6"
      />

      <!-- Basic Info -->
      <h2 class="text-2xl font-bold mb-4">Room {{ room.roomNumber }}</h2>
      <p><strong>Type:</strong> {{ room.roomType }}</p>
      <p>
        <strong>Status:</strong>
        <span :class="room.status === 'available' ? 'text-green-600' : 'text-red-600'">
          {{ room.status }}
        </span>
      </p>
      <p v-if="room.price"><strong>Price:</strong> £{{ room.price }}</p>
      <p><strong>Start:</strong> {{ formatDate(room.startTime) }}</p>
      <p><strong>End:</strong> {{ formatDate(room.endTime) }}</p>
      <p><strong>Duration Left:</strong> {{ getDurationLeft(room.endTime) }}</p>

      <!-- Occupant -->
      <div class="mt-4" v-if="room.occupant && room.status === 'occupied'">
        <h3 class="text-lg font-semibold mb-2">Occupant Info</h3>
        <p><strong>Name:</strong> {{ room.occupant.name }}</p>
        <p><strong>Age:</strong> {{ room.occupant.age }}</p>
        <p><strong>Gender:</strong> {{ room.occupant.gender }}</p>
        <p><strong>Reason:</strong> {{ room.occupant.reason }}</p>
        <p v-if="room.occupant.illness"><strong>Illness:</strong> {{ room.occupant.illness }}</p>
        <p v-if="room.email"><strong>Email:</strong> {{ room.email }}</p>
      </div>

      <div class="mt-6 flex flex-col sm:flex-row gap-3">
      <RouterLink
        :to="`/rooms/${room._id}/assign`"
        class="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
      >
        Assign / Update Occupant
      </RouterLink>

      <RouterLink
        :to="`/tenants?roomId=${room._id}`"
        class="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700"
      >
        View All Occupants
      </RouterLink>

      <button
        v-if="isAdmin && room.status === 'occupied'"
        @click="releaseRoom"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Release Room
      </button>
    </div>

    </div>

    <div v-else class="text-gray-600">Loading room details...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { API_BASE_URL } from '@/config'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const room = ref(null)
const roomId = route.params.id
const isAdmin = ref(false)
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '')

const formatDate = (d) => (d ? new Date(d).toLocaleString() : 'N/A')

onMounted(async () => {
  const role = localStorage.getItem('userRole')
  isAdmin.value = role === 'admin'

  try {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`)
    if (!res.ok) throw new Error('Room not found')
    room.value = await res.json()
  } catch (err) {
    toast.error('Failed to load room')
  }
})

const releaseRoom = async () => {
  if (!confirm('Are you sure you want to release this room?')) return

  try {
    const res = await fetch(`${API_BASE_URL}/rooms/${room.value._id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        age: '',
        gender: '',
        reason: '',
        illness: '',
        startTime: '',
        endTime: '',
        status: 'available',
      }),
    })

    if (!res.ok) throw new Error('Failed to release room')

    toast.success('Room released')
    router.push('/rooms')
  } catch (err) {
    toast.error(err.message)
  }
}

const getDurationLeft = (endTime) => {
  if (!endTime) return 'N/A'
  const now = new Date()
  const end = new Date(endTime)
  const diffMs = end - now

  if (diffMs <= 0) return 'Expired'

  const minutes = Math.floor((diffMs / 1000 / 60) % 60)
  const hours = Math.floor((diffMs / 1000 / 60 / 60) % 24)
  const days = Math.floor(diffMs / 1000 / 60 / 60 / 24)

  return `${days}d ${hours}h ${minutes}m left`
}


</script>
