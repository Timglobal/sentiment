<template>
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-family: sans-serif;">
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Assign Occupant</h2>

    <form @submit.prevent="handleSubmit">
      <div style="margin-bottom: 16px;">
        <label>Full Name</label><br />
        <input v-model="form.name" type="text" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        <p v-if="errors.name" style="color: red;">{{ errors.name }}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <label>Age</label><br />
        <input v-model="form.age" type="number" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        <p v-if="errors.age" style="color: red;">{{ errors.age }}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <label>Gender</label><br />
        <select v-model="form.gender" style="width: 100%; padding: 8px; border: 1px solid #ccc;">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <p v-if="errors.gender" style="color: red;">{{ errors.gender }}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <label>Reason for Staying</label><br />
        <input v-model="form.reason" type="text" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        <p v-if="errors.reason" style="color: red;">{{ errors.reason }}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <label>Email</label><br />
        <input v-model="form.email" type="email" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        <p v-if="errors.email" style="color: red;">{{ errors.email }}</p>
      </div>


      <div v-if="roomType === 'healthcare'" style="margin-bottom: 16px;">
        <label>Illness</label><br />
        <input v-model="form.illness" type="text" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        <p v-if="errors.illness" style="color: red;">{{ errors.illness }}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <label>Start Time</label><br />
        <input v-model="form.startTime" type="datetime-local" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        <p v-if="errors.startTime" style="color: red;">{{ errors.startTime }}</p>
      </div>

      <div style="margin-bottom: 24px;">
        <label>End Time</label><br />
        <input v-model="form.endTime" type="datetime-local" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        <p v-if="errors.endTime" style="color: red;">{{ errors.endTime }}</p>
      </div>

      <button type="submit" style="padding: 10px 16px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Assign
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { API_BASE_URL } from '@/config'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const roomId = route.params.id
const roomType = ref('') 

const form = ref({
  name: '',
  age: '',
  gender: '',
  reason: '',
  illness: '',
  startTime: '',
  endTime: '',
})

const errors = ref({})
const currentRoom = ref(null)

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms`)
    const allRooms = await res.json()
    currentRoom.value = allRooms.find((r) => r._id === roomId)
    roomType.value = currentRoom?.roomType || ''

    const o = currentRoom.value.occupant
    if (o) {
      form.value = {
        name: o.name || '',
        age: o.age || '',
        gender: o.gender || '',
        reason: o.reason || '',
        illness: o.illness || '',
        startTime: currentRoom.value.startTime || '',
        endTime: currentRoom.value.endTime || '',
        email: o?.email || '',
      }
    }
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'admin') {
      toast.error('Access denied. Admins only.')
      router.push('/rooms')
    }
  } catch (err) {
    toast.error('Could not determine room type.')
  }
})

const validateForm = () => {
  errors.value = {}

  if (!form.value.name) errors.value.name = 'Name is required'
  if (!form.value.age || form.value.age < 1) errors.value.age = 'Valid age is required'
  if (!form.value.gender) errors.value.gender = 'Gender is required'
  if (!form.value.reason) errors.value.reason = 'Reason is required'
  if (!form.value.startTime) errors.value.startTime = 'Start time is required'
  if (!form.value.endTime) errors.value.endTime = 'End time is required'
  if (!form.value.email || !form.value.email.includes('@')) {
    errors.value.email = 'Valid email is required'
  }


  if (roomType.value === 'healthcare' && !form.value.illness) {
    errors.value.illness = 'Illness info is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Please fix the form errors.')
    return
  }

  const payload = {
    name: form.value.name,
    age: form.value.age,
    gender: form.value.gender,
    reason: form.value.reason,
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    email: form.value.email,
  }

  if (roomType.value === 'healthcare') {
    payload.illness = form.value.illness
  }

  form.value = {
    name: currentRoom.occupant?.name || '',
    age: currentRoom.occupant?.age || '',
    gender: currentRoom.occupant?.gender || '',
    reason: currentRoom.occupant?.reason || '',
    illness: currentRoom.occupant?.illness || '',
    startTime: currentRoom.startTime || '',
    endTime: currentRoom.endTime || '',
  }


  try {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('Failed to assign occupant')

    toast.success('Occupant assigned successfully!')
    router.push('/rooms')
  } catch (err) {
    toast.error(err.message || 'Something went wrong')
  }
}
</script>

