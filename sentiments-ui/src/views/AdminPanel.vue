<template>
  <div style="max-width: 1024px; margin: 3rem auto; padding: 0 1rem;">

    <!-- FEEDBACK SUBMISSIONS -->
    <section style="margin-bottom: 4rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">
        📋 Feedback Submissions
      </h2>
      <p style="color: #6B7280; margin-bottom: 1.5rem;">Feedback submitted by users and colleagues</p>

      <div v-if="feedbacks.length === 0" style="color: #6B7280;">No feedback yet.</div>

      <table v-else style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
        <thead style="background-color: #F9FAFB;">
          <tr>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Sender</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Role</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">About</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Message</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fb in feedbacks" :key="fb._id" style="border-top: 1px solid #E5E7EB;">
            <td style="padding: 0.75rem;">{{ fb.senderName }}</td>
            <td style="padding: 0.75rem;">{{ fb.source }}</td>
            <td style="padding: 0.75rem;">{{ fb.workerName || fb.workerId?.name }}</td>
            <td style="padding: 0.75rem;">{{ fb.message }}</td>
            <td style="padding: 0.75rem;">{{ new Date(fb.timestamp).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- CONTACT MESSAGES -->
    <section style="margin-bottom: 4rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">
        📬 Contact Messages
      </h2>
      <p style="color: #6B7280; margin-bottom: 1.5rem;">Messages sent from the contact form</p>

      <div v-if="contacts.length === 0" style="color: #6B7280;">No messages submitted yet.</div>

      <table v-else style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
        <thead style="background-color: #F9FAFB;">
          <tr>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Name</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Email</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Message</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="msg in contacts" :key="msg._id" style="border-top: 1px solid #E5E7EB;">
            <td style="padding: 0.75rem;">{{ msg.name }}</td>
            <td style="padding: 0.75rem;">{{ msg.email }}</td>
            <td style="padding: 0.75rem;">{{ msg.message }}</td>
            <td style="padding: 0.75rem;">{{ new Date(msg.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <!-- WAITLIST ENTRIES -->
    <section style="margin-top: 4rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">
        📝 Waitlist Entries
      </h2>
      <p style="color: #6B7280; margin-bottom: 1.5rem;">People who requested early access or a demo</p>

      <div v-if="waitlist.length === 0" style="color: #6B7280;">No one on the waitlist yet.</div>

      <table v-else style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
        <thead style="background-color: #F9FAFB;">
          <tr>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Name</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Email</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Company</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Purpose</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Feedback</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in waitlist" :key="entry._id" style="border-top: 1px solid #E5E7EB;">
            <td style="padding: 0.75rem;">{{ entry.name }}</td>
            <td style="padding: 0.75rem;">{{ entry.email }}</td>
            <td style="padding: 0.75rem;">{{ entry.company || '-' }}</td>
            <td style="padding: 0.75rem;">{{ entry.purpose || '-' }}</td>
            <td style="padding: 0.75rem;">{{ entry.feedback || '-' }}</td>
            <td style="padding: 0.75rem;">{{ new Date(entry.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </section>


    <!-- REGISTERED USERS -->
    <section>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">
        👥 Registered Users
      </h2>
      <p style="color: #6B7280; margin-bottom: 1.5rem;">These are your registered users</p>

      <div v-if="users.length === 0" style="color: #6B7280;">No users yet.</div>

      <table v-else style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
        <thead style="background-color: #F9FAFB;">
          <tr>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Name</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Email</th>
            <th style="text-align: left; padding: 0.75rem; color: #374151;">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id" style="border-top: 1px solid #E5E7EB;">
            <td style="padding: 0.75rem;">{{ u.name }}</td>
            <td style="padding: 0.75rem;">{{ u.email }}</td>
            <td style="padding: 0.75rem;">{{ u.role }}</td>
          </tr>
        </tbody>
      </table>
    </section>
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

interface WaitlistEntry {
  _id: string
  name: string
  email: string
  company?: string
  purpose?: string
  feedback?: string
  createdAt: string
}

const waitlist = ref<WaitlistEntry[]>([])

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
async function fetchWaitlist() {
  try {
    const res = await fetch(`${API_BASE_URL}/waitlist`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!res.ok) throw new Error('Failed to load waitlist')
    waitlist.value = await res.json()
  } catch (err: any) {
    toast.error(err.message || 'Failed to fetch waitlist')
  }
}

onMounted(() => {
  fetchFeedbacks()
  fetchContacts()
  fetchUsers()
  fetchWaitlist()
})

</script>
