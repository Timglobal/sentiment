<!-- src/views/ContactView.vue -->
<template>
  <div class="max-w-md mx-auto">
    <h2 class="text-xl font-semibold mb-4">Contact Us</h2>
    <form @submit.prevent="submitForm">
      <label class="block mb-2">Name</label>
      <input v-model="name" class="w-full border px-3 py-2 mb-4" />

      <label class="block mb-2">Email</label>
      <input v-model="email" class="w-full border px-3 py-2 mb-4" />

      <label class="block mb-2">Message</label>
      <textarea v-model="message" class="w-full border px-3 py-2 mb-4"></textarea>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const message = ref('')

function submitForm() {
  alert('Message submitted! (Backend coming soon)')
}
</script>
