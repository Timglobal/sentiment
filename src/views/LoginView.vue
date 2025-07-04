<!-- src/views/LoginView.vue -->
<template>
  <div class="max-w-sm mx-auto">
    <h2 class="text-xl font-semibold mb-4">Login</h2>
    <form @submit.prevent="login">
      <label class="block mb-2">Email</label>
      <input v-model="email" class="w-full border px-3 py-2 mb-4" type="email" />

      <label class="block mb-2">Password</label>
      <input v-model="password" class="w-full border px-3 py-2 mb-4" type="password" />

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')

function login() {
  alert('Logging in... (Backend not connected yet)')
}
</script>
