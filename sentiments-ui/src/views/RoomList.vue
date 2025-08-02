<template>
  <div style="padding: 24px; font-family: sans-serif;">
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">All Rooms</h2>

    <!-- FILTERS -->
    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
      <div>
        <label>Status:</label>
        <select v-model="filterStatus" @change="filterRooms" style="padding: 6px;">
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
        </select>
      </div>

      <div>
        <label>Type:</label>
        <select v-model="filterType" @change="filterRooms" style="padding: 6px;">
          <option value="">All</option>
          <option value="healthcare">Healthcare</option>
          <option value="landlord">Landlord</option>
        </select>
      </div>
    </div>

    <!-- ROOM GRID -->
    <div v-if="loading">Loading rooms...</div>
    <div v-else-if="error" style="color: red;">{{ error }}</div>

    <div
      v-else
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;"
    >
      <div
        v-for="room in filteredRooms"
        :key="room._id"
        style="border: 1px solid #ccc; border-radius: 10px; padding: 16px; background: #fff;"
      >
        <img
            v-if="room.imagePath"
            :src="`${STATIC_BASE_URL}${room.imagePath}`"
            alt="Room Image"
            style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"
            />
            <h3 style="font-size: 18px; margin: 8px 0;">Room {{ room.roomNumber }}</h3>
            <p><strong>Type:</strong> {{ room.roomType }}</p>
            <p v-if="room.price"><strong>Price:</strong> £{{ room.price }}</p>
            <p>
                <strong>Status:</strong>
                <span :style="{ color: room.status === 'available' ? 'green' : 'red' }">
                    {{ room.status }}
                </span>
            </p>
            <p>
              <strong>Duration Left:</strong> {{ getDurationLeft(room.endTime) }}
            </p>

            <!-- ACTIONS -->
            <div style="margin-top: 12px; display: flex; gap: 8px;">
            <RouterLink :to="`/rooms/${room._id}`" style="padding: 6px 12px; background: #2ecc71; color: white; border: none; border-radius: 4px; text-decoration: none;">
                View
            </RouterLink>    
            <button @click="assignOccupant(room._id)" style="padding: 6px 12px; background: #3498db; color: white; border: none; border-radius: 4px;">
                Assign
            </button>
            <button @click="deleteRoom(room._id)" style="padding: 6px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px;">
                Delete
            </button>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toast-notification'
import { API_BASE_URL } from '@/config'
import { useRouter } from 'vue-router'
const router = useRouter()


const STATIC_BASE_URL = API_BASE_URL.replace('/api', '')


const toast = useToast()

const rooms = ref([])
const filteredRooms = ref([])
const loading = ref(true)
const error = ref('')
const filterStatus = ref('')
const filterType = ref('')

const fetchRooms = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms`)
    if (!res.ok) throw new Error('Failed to fetch rooms')
    const data = await res.json()
    rooms.value = data
    filteredRooms.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const filterRooms = () => {
  filteredRooms.value = rooms.value.filter((room) => {
    const statusMatch = filterStatus.value ? room.status === filterStatus.value : true
    const typeMatch = filterType.value ? room.roomType === filterType.value : true
    return statusMatch && typeMatch
  })
}

const deleteRoom = async (roomId) => {
  if (!confirm('Are you sure you want to delete this room?')) return
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Delete failed')
    rooms.value = rooms.value.filter((room) => room._id !== roomId)
    filteredRooms.value = filteredRooms.value.filter((room) => room._id !== roomId)
    toast.success('Room deleted')
  } catch (err) {
    toast.error('Error deleting room')
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


const assignOccupant = (roomId) => {
  router.push(`/rooms/${roomId}/assign`)
}


onMounted(fetchRooms)
</script>
