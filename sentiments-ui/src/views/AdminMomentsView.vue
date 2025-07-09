<template>
  <div style="max-width: 900px; margin: 3rem auto; padding: 0 1rem;">
    <!-- Title -->
    <h2 style="font-size: 1.75rem; font-weight: 700; color: #10B981; margin-bottom: 2rem;">
      🎥 Upload Staff Moment
    </h2>

    <!-- Upload Form -->
    <form @submit.prevent="submitMoment"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;"
    >
      <select v-model="form.workerId" :style="inputStyle" required>
        <option disabled value="">-- Select Worker --</option>
        <option v-for="w in workers" :key="w._id" :value="w._id">
          {{ w.name }} ({{ w.role }})
        </option>
      </select>

      <select v-model="form.mediaType" :style="inputStyle" required>
        <option disabled value="">-- Media Type --</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      <input type="file" @change="handleFileChange" required :style="inputStyle" style="grid-column: 1 / -1;" />

      <textarea
        v-model="form.description"
        placeholder="Description"
        required
        rows="3"
        :style="inputStyle"
        style="grid-column: 1 / -1; resize: none;"
      ></textarea>

      <button
        type="submit"
        :style="buttonStyle"
        style="grid-column: 1 / -1; margin-top: 0.5rem;"
      >
        ✅ Upload Moment
      </button>
    </form>

    <!-- Search -->
    <div style="margin-bottom: 2.5rem;">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="🔍 Search by worker name or description..."
        :style="inputStyle"
        style="width: 100%;"
      />
    </div>

    <!-- Uploaded Moments -->
    <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 1rem;">
      📂 Uploaded Moments
    </h3>

    <div v-if="moments.length === 0" style="color: #6B7280;">No moments found.</div>

    <div
      v-for="m in filteredMoments"
      :key="m._id"
      style="background: #fff; border: 1px solid #E5E7EB; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem;"
    >
      <p style="font-size: 0.875rem; color: #4B5563; margin-bottom: 0.25rem;">
        👤 {{ m.workerId?.name }} ({{ m.workerId?.role }})
      </p>
      <p style="font-size: 0.9rem; color: #111827;">{{ m.description }}</p>
      <p style="font-size: 0.75rem; color: #9CA3AF; margin-top: 0.25rem;">
        🕒 {{ new Date(m.timestamp).toLocaleString() }}
      </p>

      <div style="margin-top: 1rem;">
        <img
          v-if="m.mediaType === 'image'"
          :src="m.mediaUrl"
          alt="Uploaded Image"
          style="max-width: 300px; border-radius: 0.5rem; border: 1px solid #E5E7EB;"
        />
        <video
          v-else-if="m.mediaType === 'video'"
          :src="m.mediaUrl"
          controls
          style="max-width: 300px; border-radius: 0.5rem; border: 1px solid #E5E7EB;"
        ></video>
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

const inputStyle = `
  width: 100%;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: white;
  color: #111827;
  outline: none;
  transition: border-color 0.2s ease;
`

const buttonStyle = `
  background-color: #10B981;
  color: white;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
`

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
