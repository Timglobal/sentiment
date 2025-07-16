<template>
    <div class="max-w-xl mx-auto p-6 bg-white shadow rounded mt-10">
        <h2 class="text-2xl font-semibold mb-4">Create a Room</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
                <label class="block mb-1">Room Number</label>
                <input v-model="form.roomNumber" type="text" class="w-full p-2 border rounded" required />
            </div>

            <div>
                <label class="block mb-1">Room Type</label>
                <select v-model="form.roomType" class="w-full p-2 border rounded" required>
                <option value="" disabled>Select Type</option>
                <option value="healthcare">Healthcare</option>
                <option value="landlord">Landlord</option>
                </select>
            </div>

            <div v-if="form.roomType === 'landlord'">
                <label class="block mb-1">Price ($)</label>
                <input v-model="form.price" type="number" class="w-full p-2 border rounded" />
            </div>

            <div v-if="form.roomType === 'landlord'">
                <label class="block mb-1">Duration (Months)</label>
                <input v-model="form.durationInMonths" type="number" class="w-full p-2 border rounded" />
            </div>


            <div>
                <label class="block mb-1">Room Image</label>
                <input ref="imageInput" type="file" @change="handleFile" accept="image/*" class="w-full p-2 border rounded" />
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Room
         </button>
        </form>

        <div v-if="successMsg" class="text-green-600 mt-4">{{ successMsg }}</div>
    <div v-if="errorMsg" class="text-red-600 mt-4">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { API_BASE_URL } from '@/config'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const form = ref({
  roomNumber: '',
  roomType: '',
  price: '',
  durationInMonths: ''
})

const imageFile = ref(null)
const successMsg = ref('')
const errorMsg = ref('')
const imageInput = ref(null)

const handleFile = (e) => {
  imageFile.value = e.target.files[0]
}

const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('roomNumber', form.value.roomNumber)
  formData.append('roomType', form.value.roomType)
  if (form.value.roomType === 'landlord') {
    formData.append('price', form.value.price)
    formData.append('durationInMonths', form.value.durationInMonths)
  }
  if (imageFile.value) {
    formData.append('image', imageFile.value)
  }

  try {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      body: formData,
    })

    const text = await response.text() 

    if (!response.ok) {
      const errorMessage = text || 'Something went wrong'
      toast.error(errorMessage)
      return
    }

    const data = text ? JSON.parse(text) : null
    toast.success('Room created successfully!')
    errorMsg.value = ''
    form.value = { roomNumber: '', roomType: '', price: '', durationInMonths: ''}
    imageFile.value = null
    imageInput.value.value = null
  } catch (err) {
    errorMsg.value = err.message
    toast.error(err.message)
    successMsg.value = ''
  }
}
</script>
