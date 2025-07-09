<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <!-- Welcome Text -->
    <div class="text-center mb-10">
            <h2 style="font-size: 2rem; font-weight: 700; color: #10B981; margin-bottom: 1rem; font-family: sans-serif;">
        Welcome {{ user?.name }}
        </h2>
        <p style="font-size: 1.125rem; color: #4B5563; font-family: sans-serif;">
        {{
            user?.role === 'admin'
            ? 'Manage your team and analyze workforce sentiment'
            : 'Give a feedback about a staff moment'
        }}
        </p>

    </div>

    <!-- Admin Links or Feedback -->
     <div class="flex flex-wrap justify-center gap-6">
      <!-- Manage Workers (Admin only) -->
      <div
        v-if="user?.role === 'admin'"
        @click="goTo('/manage-workers')"
        class="dashboard-card"
      >
        <img src="/manage workers icon.png" alt="Manage Workers" class="card-img" />
        <div class="card-text">Manage Workers</div>
      </div>

      <!-- Analytics (Admin only) -->
      <div
        v-if="user?.role === 'admin'"
        @click="goTo('/admin-analysis')"
        class="dashboard-card"
      >
        <img src="/view analytics icon.png" alt="View Analytics" class="card-img" />
        <div class="card-text">View Analytics</div>
      </div>

      <!-- Upload Moment (Admin only) -->
      <div
        v-if="user?.role === 'admin'"
        @click="goTo('/admin-moments')"
        class="dashboard-card"
      >
        <img src="/upload moment icon.png" alt="Upload Moment" class="card-img" />
        <div class="card-text">Upload Moment</div>
      </div>

      <!-- Submit Feedback (Everyone) -->
      <div
        @click="goTo('/feedback')"
        class="dashboard-card"
      >
        <img src="/submit feedback icon.png" alt="Submit Feedback" class="card-img" />
        <div class="card-text">Submit Feedback</div>
      </div>

      <!-- Admin Panel (Admin only) -->
      <div
        v-if="user?.role === 'admin'"
        @click="goTo('/admin')"
        class="dashboard-card"
      >
        <img src="/Admin panel.png" alt="Admin Panel" class="card-img" />
        <div class="card-text">Admin Panel</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref<{ name: string; role: string } | null>(null)

onMounted(() => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')

  if (!token || !userData) {
    router.push('/login')
  } else {
    user.value = JSON.parse(userData)
  }
})

function goTo(path: string) {
  router.push(path)
}
</script>

<style scoped>
.dashboard-card {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(60%);
}

.dashboard-card:hover .card-img {
  filter: brightness(60%);
}

.card-text {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.4);
  font-size: 0.95rem;
  color: white;
  font-weight: 600;
  text-align: center;
}


</style>
