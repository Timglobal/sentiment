<template>
  <div class="max-w-xl mx-auto text-center mt-10">
    <h2 class="text-2xl font-bold text-green-700">Welcome to the Dashboard</h2>
    <p class="mt-4 text-gray-700">
      Hello <span class="font-semibold">{{ user?.name }}</span>, you're logged in as <span class="italic">{{ user?.role }}</span>.
    </p>
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
    router.push('/login') // not logged in — redirect
  } else {
    user.value = JSON.parse(userData)
  }
})
</script>
