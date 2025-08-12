<template>
  <div
    class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
    :class="className"
    @click="handleClick"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface Props {
  value: string
  className?: string
}

const props = defineProps<Props>()

const selectComponent = inject('select') as any

const handleClick = () => {
  if (selectComponent) {
    selectComponent.updateValue(props.value)
  }
}
</script>
