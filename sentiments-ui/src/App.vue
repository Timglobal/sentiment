<!-- src/App.vue -->
<template>
  <header class="p-4 shadow flex justify-between items-center">
    <h1 class="text-xl font-bold text-blue-700">TG Global</h1>
    <nav class="space-x-4">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
      <RouterLink v-if="!isLoggedIn" to="/login">Login</RouterLink>
      <RouterLink v-if="!isLoggedIn" to="/signup">Signup</RouterLink>
      <RouterLink v-if="isLoggedIn" to="/dashboard">Dashboard</RouterLink>
      <RouterLink v-if="isLoggedIn" to="/feedback">Feedback</RouterLink>
      <RouterLink v-if="isLoggedIn && user?.role === 'admin'" to="/manage-workers">Workers </RouterLink>
      <RouterLink v-if="isLoggedIn && user?.role === 'admin'" to="/admin">Admin Panel</RouterLink>
      <RouterLink v-if="isLoggedIn && user?.role === 'admin'" to="/admin-moments">Moments</RouterLink>
      <RouterLink v-if="isLoggedIn && user?.role === 'admin'" to="/admin-analysis">Analysis</RouterLink>
      <button v-if="isLoggedIn" @click="logout" class="text-red-600">Logout</button>
      <p class="text-sm text-gray-500">Status: {{ isLoggedIn ? 'Logged in' : 'Logged out' }}</p>
    </nav>
  </header>

  <main class="p-4">
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterLink, RouterView , useRouter} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn, user } = storeToRefs(auth)

function logout() {
  auth.logout()
  router.push('/') 
}
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
