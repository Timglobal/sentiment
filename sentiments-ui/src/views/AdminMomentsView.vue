<template>
  <div class="max-w-3xl mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4 text-green-700">🎥 Upload Staff Moment</h2>

    <form @submit.prevent="submitMoment" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <select v-model="form.workerId" class="border px-3 py-2 rounded" required>
        <option disabled value="">-- Select Worker --</option>
        <option v-for="w in workers" :key="w._id" :value="w._id">
          {{ w.name }} ({{ w.role }})
        </option>
      </select>

      <select v-model="form.mediaType" class="border px-3 py-2 rounded" required>
        <option disabled value="">-- Media Type --</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      <input type="file" @change="handleFileChange" class="col-span-2" required />

      <textarea v-model="form.description" placeholder="Description" class="border px-3 py-2 rounded col-span-2" required />

      <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded col-span-2">
        Upload Moment
      </button>
    </form>
    <div class="mb-6">
        <input
            v-model="searchTerm"
            type="text"
            placeholder="🔍 Search by worker name or description..."
            class="w-full px-3 py-2 border rounded"
        />
    </div>

    <h3 class="text-xl font-semibold mb-3">📂 Uploaded Moments</h3>
    <div v-if="moments.length === 0" class="text-gray-500">No moments found.</div>
    <div v-for="m in filteredMoments" :key="m._id" class="...">
      <p class="text-sm text-gray-600">👤 {{ m.workerId?.name }} ({{ m.workerId?.role }})</p>
      <p class="text-sm">{{ m.description }}</p>
      <p class="text-xs text-gray-400">Uploaded: {{ new Date(m.timestamp).toLocaleString() }}</p>
      <div class="mt-2">
        <img v-if="m.mediaType === 'image'" :src="m.mediaUrl" class="w-full max-w-sm rounded" />
        <video v-if="m.mediaType === 'video'" :src="m.mediaUrl" class="w-full max-w-sm rounded" controls></video>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toastification'
import { computed } from 'vue'

const toast = useToast()

const form = ref({
  workerId: '',
  description: '',
  mediaType: '',
  submittedBy: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : 'admin'
})

interface Worker {
  _id: string
  name: string
  role: string
}

interface Moment {
  _id: string
  workerId: Worker
  mediaType: 'image' | 'video'
  mediaUrl: string
  description: string
  timestamp: string
}

const workers = ref<Worker[]>([])
const moments = ref<Moment[]>([])

const selectedFile = ref<File | null>(null)

const searchTerm = ref('')

const filteredMoments = computed(() =>
  moments.value.filter(m =>
    m.workerId?.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)


function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    selectedFile.value = target.files[0]
  }
}

async function fetchWorkers() {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE_URL}/workers`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  workers.value = data
}

async function fetchMoments() {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE_URL}/moments`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  moments.value = await res.json()
}

async function submitMoment() {
    if (!selectedFile.value) {
        toast.error('Please select a file')
        return
    }

    const formData = new FormData()
    formData.append('media', selectedFile.value)
    formData.append('workerId', form.value.workerId)
    formData.append('description', form.value.description)
    formData.append('mediaType', form.value.mediaType)
    formData.append('submittedBy', form.value.submittedBy)
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE_URL}/moments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    if (!res.ok) throw new Error('Upload failed')
    toast.success('✅ Moment uploaded!')
    await fetchMoments()
    form.value = { workerId: '', description: '', mediaType: '', submittedBy: form.value.submittedBy }
    selectedFile.value = null
  } catch (err: any) {
    toast.error('❌ Error: ' + err.message)
  }
}

onMounted(() => {
  fetchWorkers()
  fetchMoments()
})
</script>
