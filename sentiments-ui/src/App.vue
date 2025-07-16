<template> 
  <div class="app-wrapper">
    <!-- NAVBAR -->
    <header class="navbar">
      <div class="logo-title">
        <RouterLink to="/">
          <img src="/removebg-preview.png" alt="Logo" class="logo" />
        </RouterLink>
      </div>

      <nav class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
        <RouterLink to="/product">Product</RouterLink>

        <RouterLink v-if="!isLoggedIn" to="/login">Login</RouterLink>
        <RouterLink v-if="!isLoggedIn" to="/signup">Signup</RouterLink>

        <RouterLink v-if="isLoggedIn" to="/dashboard">Dashboard</RouterLink>
        
        <button v-if="isLoggedIn" @click="logout" class="logout-btn">Logout</button>
      </nav>
    </header>

    <p class="status">Status: {{ isLoggedIn ? 'Logged in' : 'Logged out' }}</p>

    <!-- PAGE CONTENT -->
    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
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
/* Ensure html and body stretch full screen - move to global if needed */
:global(html, body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Segoe UI', sans-serif;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* NAVBAR STYLES */
.navbar {
  width: 100%;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.logo-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo {
  width: 90px;
  height: 40px;
  object-fit: contain;
}

.site-title {
  font-size: 18px;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  min-width: 200px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #1d4ed8;
}

.logout-btn {
  background: none;
  border: none;
  color: red;
  font-weight: bold;
  cursor: pointer;
}

/* STATUS */
.status {
  font-size: 12px;
  color: #555;
  text-align: center;
  margin-top: 4px;
}

/* PAGE CONTENT */
.page-content {
  flex-grow: 1;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}
</style>
