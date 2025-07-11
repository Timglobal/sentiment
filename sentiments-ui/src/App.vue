<!-- src/App.vue -->
<template>
  <header class="bg-white shadow-md px-4 py-3 flex flex-wrap justify-between items-center">
  <div class="flex items-center gap-3">
    <RouterLink to="/">
      <img src="/logo.png" alt="Tim Global Logo" class="w-14 h-14" />
    </RouterLink>
    <h1 class="text-lg font-bold text-gray-800">Timglobal</h1>
  </div>

  <nav class="flex flex-wrap items-center gap-3 text-sm">
    <RouterLink to="/" class="hover:text-blue-600">Home</RouterLink>
    <RouterLink to="/about" class="hover:text-blue-600">About us</RouterLink>
    <RouterLink to="/contact" class="hover:text-blue-600">Contact</RouterLink>
    <RouterLink to="/product" class="hover:text-blue-600">Product</RouterLink>

    <RouterLink v-if="!isLoggedIn" to="/login" class="hover:text-blue-600">Login</RouterLink>
    <RouterLink v-if="!isLoggedIn" to="/signup" class="hover:text-blue-600">Signup</RouterLink>

    <RouterLink v-if="isLoggedIn" to="/dashboard" class="hover:text-blue-600">Dashboard</RouterLink>
    <RouterLink v-if="isLoggedIn" to="/feedback" class="hover:text-blue-600">Feedback</RouterLink>

    <RouterLink v-if="isLoggedIn && user?.role === 'admin'" to="/manage-workers" class="hover:text-blue-600">Workers</RouterLink>
    <RouterLink v-if="isLoggedIn && user?.role === 'admin'" to="/admin" class="hover:text-blue-600">Admin Panel</RouterLink>
    <RouterLink v-if="isLoggedIn && user?.role === 'admin'" to="/admin-moments" class="hover:text-blue-600">Moments</RouterLink>
    <RouterLink v-if="isLoggedIn && user?.role === 'admin'" to="/admin-analysis" class="hover:text-blue-600">Analysis</RouterLink>

    <button v-if="isLoggedIn" @click="logout" class="text-red-600 font-semibold">Logout</button>
  </nav>

  <p class="text-xs text-gray-500 mt-2 w-full text-center sm:w-auto sm:mt-0">Status: {{ isLoggedIn ? 'Logged in' : 'Logged out' }}</p>
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
  color: blue;
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
