<template>
  <div class="app-wrapper">
    <!-- TOP BAR -->
    <header class="navbar">
      <!-- Hamburger -->
      <div class="hamburger" @click="toggleMenu">☰</div>

      <!-- Logo in center -->
      <div class="logo-center">
        <RouterLink to="/">
          <img src="/removebg-preview.png" alt="Logo" class="logo" />
        </RouterLink>
      </div>
    </header>

    <!-- Dropdown Menu -->
    <div v-if="showMenu" class="dropdown-menu">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
      <RouterLink to="/product">Product</RouterLink>

      <RouterLink v-if="!isLoggedIn" to="/login">Login</RouterLink>
      <RouterLink v-if="!isLoggedIn" to="/signup">Signup</RouterLink>

      <RouterLink v-if="isLoggedIn" to="/dashboard">Dashboard</RouterLink>
      <button v-if="isLoggedIn" @click="logout" class="logout-btn">Logout</button>

      <!-- Login status -->
      <p class="status">Status: {{ isLoggedIn ? 'Logged in' : 'Logged out' }}</p>
    </div>

    <!-- MAIN PAGE CONTENT -->
    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)

const showMenu = ref(false)
function toggleMenu() {
  showMenu.value = !showMenu.value
}

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', sans-serif;
  width: 100%;
  height: 100%;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* HEADER BAR */
.navbar {
  width: 100%;
  background-color: #ffffff;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: none;
  position: relative;
}

/* Hamburger icon */
.hamburger {
  font-size: 24px;
  cursor: pointer;
}

/* Logo center */
.logo-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.logo {
  width: 140px;
  height: auto;
}

/* DROPDOWN MENU */
.dropdown-menu {
  background-color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dropdown-menu a {
  text-decoration: none;
  color: purple;
  font-size: 16px;
}

.dropdown-menu a:hover {
  color: #1d4ed8;
}

.logout-btn {
  background: none;
  border: none;
  color: red;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
}

.status {
  font-size: 14px;
  color: #555;
  margin-top: 10px;
}

/* MAIN PAGE */
.page-content {
  flex-grow: 1;
  padding: 20px;
}
</style>
