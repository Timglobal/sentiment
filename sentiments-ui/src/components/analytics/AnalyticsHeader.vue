<template>
  <div class="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
    <div class="space-y-2">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <Button
          :variant="isRealTimeEnabled ? 'default' : 'outline'"
          size="sm"
          @click="toggleRealTime"
          class="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw :class="`w-4 h-4 ${isRealTimeEnabled ? 'animate-spin' : ''}`" />
          {{ isRealTimeEnabled ? "Live" : "Static" }}
        </Button>
      </div>
      <p class="text-muted-foreground text-sm">
        Comprehensive insights and performance metrics for {{ selectedWorkerName.toLowerCase() }}
        <span v-if="isRealTimeEnabled" class="text-green-600 text-sm ml-2 block sm:inline">
          • Last updated: {{ lastUpdated.toLocaleTimeString() }}
        </span>
      </p>
    </div>

    <div class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      <Select 
        :value="selectedDepartment" 
        @update:modelValue="$emit('update:selectedDepartment', $event)"
        class="w-full sm:w-[160px]"
      >
        <template #icon>
          <Users class="w-4 h-4 mr-2" />
        </template>
        <SelectContent>
          <SelectItem 
            v-for="dept in departments" 
            :key="dept.id"
            :value="dept.id"
          >
            {{ dept.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select 
        :value="selectedWorker" 
        @update:modelValue="$emit('update:selectedWorker', $event)"
        class="w-full sm:w-[180px]"
      >
        <template #icon>
          <Filter class="w-4 h-4 mr-2" />
        </template>
        <SelectContent>
          <SelectItem 
            v-for="worker in workers" 
            :key="worker.id"
            :value="worker.id.toString()"
          >
            {{ worker.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select 
        :value="selectedTimeRange" 
        @update:modelValue="$emit('update:selectedTimeRange', $event)"
        class="w-full sm:w-[140px]"
      >
        <template #icon>
          <Calendar class="w-4 h-4 mr-2" />
        </template>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="6m">Last 6 months</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>

      <Button class="w-full sm:w-auto" @click="exportData">
        <Download class="w-4 h-4 mr-2" />
        <span class="hidden sm:inline">Export Report</span>
        <span class="sm:hidden">Export</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import SelectContent from '@/components/ui/SelectContent.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import { RefreshCw, Users, Filter, Calendar, Download } from 'lucide-vue-next'

interface Props {
  isRealTimeEnabled: boolean
  selectedWorkerName: string
  selectedDepartment: string
  selectedWorker: string
  selectedTimeRange: string
  lastUpdated: Date
  workers: Array<{ id: string | number; name: string; department?: string; role?: string }>
  departments: Array<{ id: string; name: string }>
}

interface Emits {
  'update:selectedDepartment': [value: string]
  'update:selectedWorker': [value: string]
  'update:selectedTimeRange': [value: string]
  'toggle-real-time': []
  'export-data': []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleRealTime = () => {
  emit('toggle-real-time')
}

const exportData = () => {
  emit('export-data')
}
</script>
