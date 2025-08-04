<template>
  <div class="max-h-60 overflow-auto">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, getCurrentInstance } from 'vue'

// Provide the select context to child components
const instance = getCurrentInstance()
provide('select', instance?.parent?.exposed)
</script>
