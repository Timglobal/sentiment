<template>
  <h3 :class="['text-2xl font-semibold leading-none tracking-tight', className]" v-bind="$attrs">
    <slot />
  </h3>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

defineProps<Props>()
</script>
