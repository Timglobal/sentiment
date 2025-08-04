<template>
  <div class="app-wrapper">
    <Navbar v-if="!isDashboardRoute"/>
    <main>
      <router-view />
    </main>
    <Footer v-if="!isDashboardRoute" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()

const isDashboardRoute = computed(() => {
  return route.meta.layout === 'dashboard'
})
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>