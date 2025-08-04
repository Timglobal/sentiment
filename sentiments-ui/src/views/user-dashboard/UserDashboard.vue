<template>
  <UserDashboardLayout>
    <div class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Redirecting to submit feedback...</p>
      </div>
    </div>
  </UserDashboardLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserDashboardLayout from '../../components/UserDashboardLayout.vue'

const router = useRouter()

onMounted(() => {
  // Redirect to submit feedback page since it's the only page available
  router.replace('/user-dashboard/submit-feedback')
})
</script>
