
<template>
  <div class="mb-8">
    <h3 class="text-2xl font-semibold mb-4">📋 Feedback Submissions</h3>

    <div v-if="feedbacks.length === 0" class="text-gray-600">No feedback yet.</div>

    <table v-else class="w-full table-auto border">
        <thead class="bg-gray-100">
        <tr>
            <th class="p-2 text-left">Sender</th>
            <th class="p-2 text-left">Role</th>
            <th class="p-2 text-left">About</th>
            <th class="p-2 text-left">Message</th>
            <th class="p-2 text-left">Date</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="fb in feedbacks" :key="fb._id">
            <td class="p-2">{{ fb.senderName }}</td>
            <td class="p-2">{{ fb.source }}</td>
            <td class="p-2">{{ fb.workerName || fb.workerId?.name }}</td>
            <td class="p-2">{{ fb.message }}</td>
            <td class="p-2">{{ new Date(fb.timestamp).toLocaleString() }}</td>
        </tr>
        </tbody>
    </table>
    </div>
    <!-- Contact Messages -->
    <div class="mt-12">
    <h3 class="text-2xl font-semibold mb-4">📬 Contact Messages</h3>

    <div v-if="contacts.length === 0" class="text-gray-600">No messages submitted yet.</div>

    <table v-else class="w-full table-auto border">
        <thead class="bg-gray-100">
        <tr>
            <th class="p-2 text-left">Name</th>
            <th class="p-2 text-left">Email</th>
            <th class="p-2 text-left">Message</th>
            <th class="p-2 text-left">Date</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="msg in contacts" :key="msg._id">
            <td class="p-2">{{ msg.name }}</td>
            <td class="p-2">{{ msg.email }}</td>
            <td class="p-2">{{ msg.message }}</td>
            <td class="p-2">{{ new Date(msg.createdAt).toLocaleString() }}</td>
        </tr>
        </tbody>
    </table>
    </div>
    <div class="mt-12">
    <h3 class="text-2xl font-semibold mb-4">👥 Registered Users</h3>
    <table v-if="users.length" class="w-full table-auto border">
        <thead class="bg-gray-100">
        <tr>
            <th class="p-2 text-left">Name</th>
            <th class="p-2 text-left">Email</th>
            <th class="p-2 text-left">Role</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="u in users" :key="u._id">
            <td class="p-2">{{ u.name }}</td>
            <td class="p-2">{{ u.email }}</td>
            <td class="p-2">{{ u.role }}</td>
        </tr>
        </tbody>
    </table>
    <div v-else class="text-gray-600">No users yet.</div>
    </div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toastification'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const { isLoggedIn, user } = storeToRefs(auth)

interface FeedbackEntry {
  _id: string
  senderName: string
  senderEmail?: string
  workerName?: string
  workerId?: {
    _id: string
    name: string
    role: string
  }
  source: string
  message: string
  timestamp: string
}

interface ContactMessage {
  _id: string
  name: string
  email: string
  message: string
  createdAt: string
}

interface UserEntry {
  _id: string
  name: string
  email: string
  role: string
}
const users = ref<UserEntry[]>([])

const feedbacks = ref<FeedbackEntry[]>([])
const contacts = ref<ContactMessage[]>([])

const toast = useToast()

async function fetchFeedbacks() {
  try {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!res.ok) throw new Error('Failed to load feedbacks')
    feedbacks.value = await res.json()
  } catch (err: any) {
    toast.error(err.message || 'Something went wrong')
  }
}

async function fetchContacts() {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!res.ok) throw new Error('Failed to load contact messages')
    contacts.value = await res.json()
  } catch (err: any) {
    toast.error(err.message || 'Could not fetch messages')
  }
}

async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!res.ok) throw new Error('Failed to load users')
    users.value = await res.json()
  } catch (err: any) {
    toast.error(err.message || 'Failed to fetch users')
  }
}

onMounted(() => {
  fetchFeedbacks()
  fetchContacts()
  fetchUsers()
})

</script>
