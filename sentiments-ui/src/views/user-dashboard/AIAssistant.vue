<template>
  <UserDashboardLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">AI Assistant</h2>
          <p class="text-gray-600">
            {{ userContext.role === 'staff'
              ? 'Voice-powered assistant for task management, patient information, and feedback collection'
              : 'Voice assistant for feedback submission and general healthcare inquiries'
            }}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <Badge :class="userContext.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
            {{ userContext.role === 'staff' ? 'Staff Member' : 'Patient' }}
          </Badge>
        </div>
      </div>

      <!-- Call Interface Card -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Call Controls -->
        <Card>
          <CardContent class="p-8 text-center">
            <div class="space-y-6">
              <!-- AI Assistant Avatar/Status -->
              <div class="mx-auto">
                <div class="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center relative overflow-hidden avatar-container"
                     :class="{
                       'border-4 border-green-300 shadow-lg ready-to-listen': isInCall && (isListening || isUserSpeaking || isReadyToListen),
                       'border-4 border-blue-300 shadow-lg ai-speaking-avatar': isInCall && isSpeaking,
                       'border-4 border-yellow-300 shadow-lg': isInCall && isProcessing,
                       'border-4 border-gray-200': !isInCall,
                       'border-4 border-red-300': isInCall && !isConnected,
                       'border-4 border-purple-300 shadow-md': isInCall && vad && !isUserSpeaking && !isListening
                     }">

                  <!-- AI Profile Image -->
                  <img
                    src="/aiimage.jpg"
                    alt="AI Assistant"
                    class="w-full h-full object-cover rounded-full transition-all duration-300"
                    :class="{
                      'brightness-110 scale-105': isInCall && (isListening || isUserSpeaking),
                      'brightness-100': !isInCall,
                      'grayscale': isInCall && !isConnected
                    }"
                  />

                  <!-- Resonance Animation Rings when AI is Speaking -->
                  <div v-if="isSpeaking" class="absolute inset-0 pointer-events-none">
                    <!-- Primary resonance ring -->
                    <div class="absolute inset-0 rounded-full border-3 border-blue-400 opacity-70 resonance-ring"></div>
                    <!-- Secondary resonance ring -->
                    <div class="absolute inset-1 rounded-full border-2 border-blue-300 opacity-50 resonance-ring"></div>
                    <!-- Tertiary resonance ring -->
                    <div class="absolute inset-3 rounded-full border-1 border-blue-200 opacity-30 resonance-ring"></div>
                    <!-- Quaternary resonance ring -->
                    <div class="absolute inset-5 rounded-full border-1 border-blue-100 opacity-20 resonance-ring"></div>
                  </div>

                  <!-- Pulse overlay for different states -->
                  <div v-if="isInCall && (isListening || isUserSpeaking)"
                       class="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-pulse"></div>
                  <div v-if="isInCall && isProcessing"
                       class="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-pulse"></div>
                  <div v-if="isInCall && !isConnected"
                       class="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-pulse"></div>

                  <!-- Status Icon Overlay -->
                  <div class="absolute bottom-[-48px] right-[-48px] w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
                       :class="{
                         'border-2 border-green-400': isInCall && (isListening || isUserSpeaking),
                         'border-2 border-blue-400': isInCall && isSpeaking,
                         'border-2 border-yellow-400': isInCall && isProcessing,
                         'border-2 border-gray-300': !isInCall,
                         'border-2 border-red-400': isInCall && !isConnected
                       }">
                    <Mic class="w-4 h-4" v-if="isInCall && (isListening || isUserSpeaking)"
                         :class="'text-green-600'" />
                    <Bot class="w-4 h-4" v-else-if="isInCall && isSpeaking"
                         :class="'text-blue-600'" />
                    <div v-else-if="isInCall && isProcessing"
                         class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    <div v-else-if="isInCall && !isConnected"
                         class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <Bot class="w-4 h-4 text-gray-500" v-else />
                  </div>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  {{ isInCall ? statusMessage : 'AI Healthcare Assistant' }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ isInCall
                    ? (isUserSpeaking ? 'You are speaking...'
                       : isListening ? 'Recording your voice...'
                       : isSpeaking ? 'AI is responding...'
                       : isProcessing ? 'Processing your request...'
                       : isReadyToListen ? '🎙️ Ready - Start speaking now!'
                       : 'Ready for conversation - just start speaking')
                    : 'Start a natural voice conversation with your AI assistant'
                  }}
                </p>
              </div>

              <!-- Connection Status -->
              <div v-if="isInCall" class="flex items-center justify-center space-x-2">
                <div class="w-3 h-3 rounded-full"
                     :class="isConnected ? 'bg-green-500' : 'bg-red-500'"></div>
                <span class="text-sm font-medium" :class="isConnected ? 'text-green-700' : 'text-red-700'">
                  {{ isConnected ? 'Connected' : 'Connection Lost' }}
                </span>
              </div>

              <!-- Voice Level Indicator -->
              <div v-if="isInCall && isListening" class="flex items-center justify-center space-x-1">
                <span class="text-sm text-gray-600 mr-3">Voice Level:</span>
                <div v-for="i in 5" :key="i"
                     class="w-2 h-8 bg-gray-200 rounded transition-colors duration-150"
                     :class="{ 'bg-green-500': volumeLevel >= i * 20 }"></div>
              </div>

              <!-- VAD Speech Detection Indicator -->
              <div v-if="isInCall" class="flex items-center justify-center space-x-2 text-sm">
                <div class="flex items-center space-x-2" :class="isUserSpeaking ? 'text-blue-600' : 'text-gray-400'">
                  <div class="w-2 h-2 rounded-full transition-colors duration-200"
                       :class="isUserSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'"></div>
                  <span class="font-medium">
                    {{ isUserSpeaking ? 'Speech Detected' : 'Listening for speech' }}
                  </span>
                </div>
              </div>

              <!-- Ready to Listen Indicator -->
              <div v-if="isInCall && isReadyToListen && !isUserSpeaking && !isSpeaking && !isProcessing"
                   class="flex items-center justify-center space-x-2 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-green-800 font-semibold text-sm">Ready - Start Speaking</span>
                <div class="flex space-x-1">
                  <div class="w-1 h-4 bg-green-400 rounded animate-pulse" style="animation-delay: 0s"></div>
                  <div class="w-1 h-4 bg-green-400 rounded animate-pulse" style="animation-delay: 0.2s"></div>
                  <div class="w-1 h-4 bg-green-400 rounded animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
              </div>

              <!-- Call Controls -->
              <div class="space-y-4">
                <div v-if="!isInCall" class="space-y-3">
                  <Button
                    @click="startCall"
                    size="lg"
                    class="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
                  >
                    <Phone class="w-6 h-6 mr-3" />
                    Start AI Call
                  </Button>
                  <p class="text-xs text-gray-500">
                    {{ userContext.role === 'staff'
                      ? 'Available features: Task management, Patient lookup, Feedback collection'
                      : 'Available features: Feedback submission, General inquiries'
                    }}
                  </p>
                </div>

                <div v-else class="space-y-4">
                  <!-- Automatic Conversation Status -->
                  <div class="text-center space-y-3">
                    <div class="flex items-center justify-center space-x-2 text-sm">
                      <div class="w-3 h-3 rounded-full"
                           :class="{
                             'bg-green-500 animate-pulse': isUserSpeaking,
                             'bg-blue-500 animate-pulse': isSpeaking,
                             'bg-yellow-500 animate-pulse': isProcessing,
                             'bg-green-400 animate-pulse': isReadyToListen && !isUserSpeaking && !isSpeaking && !isProcessing,
                             'bg-gray-400': !isConnected
                           }"></div>
                      <span class="font-medium text-gray-700">
                        {{ isUserSpeaking ? 'You are speaking...'
                           : isSpeaking ? 'AI is responding...'
                           : isProcessing ? 'Processing...'
                           : isReadyToListen ? '🎙️ Ready - Just start speaking!'
                           : 'Connecting...' }}
                      </span>
                    </div>

                    <!-- Conversation Flow Indicator -->
                    <div class="flex items-center justify-center space-x-1 text-xs text-gray-500">
                      <div class="flex items-center space-x-1">
                        <div class="w-2 h-2 rounded-full bg-green-400"></div>
                        <span>Speak</span>
                      </div>
                      <span>→</span>
                      <div class="flex items-center space-x-1">
                        <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span>AI Responds</span>
                      </div>
                      <span>→</span>
                      <div class="flex items-center space-x-1">
                        <div class="w-2 h-2 rounded-full bg-green-400"></div>
                        <span>Speak Again</span>
                      </div>
                    </div>
                  </div>

                  <!-- End Call Button -->
                  <div class="flex justify-center">
                    <Button
                      @click="endCall"
                      size="lg"
                      class="min-w-[140px] h-12 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <PhoneOff class="w-5 h-5 mr-2" />
                      End Call
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Instructions -->
              <div class="text-left bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-900 mb-2 flex items-center">
                  <Info class="w-4 h-4 mr-2" />
                  How to Use
                </h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• Click "Start AI Call" to begin</li>
                  <li>• Allow microphone access when prompted</li>
                  <li v-if="vad">• <strong>Automatic Conversation:</strong> Just speak naturally - no buttons needed!</li>
                  <li v-else>• Click "Talk" and speak clearly</li>
                  <li>• AI will automatically respond and listen for your next input</li>
                  <li>• Click "End Call" when finished</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Right Column: Conversation History -->
        <Card>
          <CardContent class="p-0">
            <div class="h-full flex flex-col">
              <!-- Chat Header -->
              <div class="p-4 border-b bg-gray-50 rounded-t-lg">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <MessageSquare class="w-5 h-5 text-gray-600" />
                    <span class="font-medium text-gray-900">Conversation History</span>
                    <Badge v-if="conversation.length > 0" class="bg-blue-100 text-blue-800">
                      {{ conversation.length }} messages
                    </Badge>
                  </div>
                  <button
                    v-if="conversation.length > 0"
                    @click="clearConversation"
                    class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <!-- Messages -->
              <div ref="conversationContainer" class="flex-1 overflow-y-auto p-4 space-y-4 min-h-96 max-h-96">
                <div v-if="conversation.length === 0" class="text-center py-8">
                  <MessageCircle class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p class="text-gray-600">No conversation yet</p>
                  <p class="text-sm text-gray-500 mt-1">Start a call to begin talking with your AI assistant</p>
                </div>

                <div v-for="(message, index) in conversation" :key="index"
                     class="flex" :class="message.type === 'user' ? 'justify-end' : 'justify-start'">
                  <div class="max-w-xs lg:max-w-md">
                    <div class="px-4 py-2 rounded-lg"
                         :class="message.type === 'user'
                           ? 'bg-blue-600 text-white rounded-br-sm'
                           : 'bg-gray-100 text-gray-900 rounded-bl-sm'">
                      <p class="text-sm">{{ message.text }}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 px-1"
                       :class="message.type === 'user' ? 'text-right' : 'text-left'">
                      {{ formatTime(message.timestamp) }}
                    </p>
                  </div>
                </div>

                <!-- Typing Indicator -->
                <div v-if="isProcessing" class="flex justify-start">
                  <div class="max-w-xs px-4 py-2 bg-gray-100 rounded-lg rounded-bl-sm">
                    <div class="flex space-x-1">
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Features Overview -->
      <Card v-if="!isInCall">
        <CardContent class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Available AI Assistant Features</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-if="userContext.role === 'staff' || userContext.role === 'admin'" class="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-medium text-blue-900">Task Management</h4>
                <p class="text-sm text-blue-700">Create and manage patient tasks with natural voice commands</p>
              </div>
            </div>

            <div v-if="userContext.role === 'staff' || userContext.role === 'admin'" class="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <Users class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-medium text-green-900">Patient Information</h4>
                <p class="text-sm text-green-700">Retrieve and discuss patient records and medical history</p>
              </div>
            </div>

            <div class="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
              <MessageSquare class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-medium text-orange-900">Feedback Collection</h4>
                <p class="text-sm text-orange-700">Submit healthcare feedback through natural conversation</p>
              </div>
            </div>

            <div v-if="userContext.role === 'admin'" class="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
              <BarChart class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-medium text-purple-900">Analytics & Reports</h4>
                <p class="text-sm text-purple-700">Access system analytics and generate reports</p>
              </div>
            </div>

            <div class="flex items-start space-x-3 p-4 bg-indigo-50 rounded-lg">
              <HelpCircle class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-medium text-indigo-900">General Support</h4>
                <p class="text-sm text-indigo-700">Get help with system navigation and general questions</p>
              </div>
            </div>

            <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Shield class="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-medium text-gray-900">Secure & Private</h4>
                <p class="text-sm text-gray-700">All conversations are encrypted and HIPAA compliant</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Error Display -->
      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start space-x-3">
          <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-sm font-medium text-red-800">Connection Error</p>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
          <button @click="clearError" class="text-red-600 hover:text-red-800">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </UserDashboardLayout>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { aiAssistantService } from '@/services/aiAssistantService'
import { WS_BASE_URL } from '@/config'
import { MicVAD, utils } from '@ricky0123/vad-web'
import UserDashboardLayout from '@/components/UserDashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  Mic,
  MessageSquare,
  MessageCircle,
  Bot,
  Phone,
  PhoneOff,
  AlertCircle,
  X,
  Info,
  CheckCircle2,
  Users,
  BarChart,
  HelpCircle,
  Shield
} from 'lucide-vue-next'

const router = useRouter()

// Refs
const conversationContainer = ref<HTMLElement>()
const audioContext = ref<AudioContext | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const socket = ref<WebSocket | null>(null)
const synthesis = ref<SpeechSynthesis | null>(null)
const vad = ref<MicVAD | null>(null)

// State
const isInCall = ref(false)
const isConnected = ref(false)
const isListening = ref(false)
const isSpeaking = ref(false)
const isProcessing = ref(false)
const volumeLevel = ref(0)
const error = ref('')
const isUserSpeaking = ref(false)
const speechStartTime = ref<number | null>(null)
const silenceTimeout = ref<number | null>(null)
const isReadyToListen = ref(false)
const vadActive = ref(false) // Track VAD state to prevent multiple starts

const conversation = ref<Array<{
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
}>>([])

const userContext = reactive({
  role: localStorage.getItem('userRole') as 'staff' | 'patient' | 'admin',
  name: localStorage.getItem('userName') || 'User',
  userId: localStorage.getItem('userId') || '',
  companyName: localStorage.getItem('companyName') || ''
})

// Computed
const statusMessage = computed(() => {
  if (!isInCall.value) return 'AI Healthcare Assistant'
  if (!isConnected.value) return 'Connecting...'
  if (isProcessing.value) return 'AI is processing...'
  if (isSpeaking.value) return 'AI is speaking...'
  if (isUserSpeaking.value) return 'Listening to you...'
  if (isListening.value) return 'Recording your voice...'
  if (isReadyToListen.value) return 'Ready - just start speaking'
  return 'Ready for conversation - just start speaking'
})

// Call Management
const startCall = async () => {
  try {
    isInCall.value = true
    await initializeAudio()
    connectWebSocket()
  } catch (err) {
    console.error('Error starting call:', err)
    error.value = 'Failed to start the AI call. Please check your microphone permissions.'
    isInCall.value = false
  }
}

const endCall = async () => {
  isInCall.value = false
  isListening.value = false
  isSpeaking.value = false
  isProcessing.value = false
  isUserSpeaking.value = false
  isReadyToListen.value = false
  vadActive.value = false

  // Clear any timeouts
  if (silenceTimeout.value) {
    clearTimeout(silenceTimeout.value)
    silenceTimeout.value = null
  }

  // Destroy VAD instance
  if (vad.value) {
    try {
      console.log('🧹 Cleaning up VAD instance...')
      await vad.value.pause()  // Stop VAD detection first
      vad.value.destroy()
      vad.value = null
      vadActive.value = false
      console.log('✅ VAD stopped and destroyed')
    } catch (err) {
      console.error('❌ Error destroying VAD:', err)
      vad.value = null // Ensure it's null even if destroy fails
      vadActive.value = false
    }
  }

  if (socket.value) {
    socket.value.close()
  }
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
  const mediaRecorder = (window as any).currentMediaRecorder
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  isConnected.value = false
}

// WebSocket Connection
const connectWebSocket = () => {
  const token = localStorage.getItem('token')
  console.log('🔗 Connecting WebSocket with token:', !!token)
  console.log('🔗 WS_BASE_URL:', WS_BASE_URL)

  if (!token) {
    error.value = 'No authentication token found. Please log in again.'
    isInCall.value = false
    return
  }

  const wsUrl = `${WS_BASE_URL}/ai-voice-stream?token=${token}`
  console.log('🔗 Attempting WebSocket connection to:', wsUrl)

  try {
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log('✅ WebSocket connected successfully')
      isConnected.value = true
      error.value = ''

      // Send initial context
      sendMessage('init', {
        userRole: userContext.role,
        userName: userContext.name,
        userId: userContext.userId,
        companyName: userContext.companyName
      })
      console.log('📤 Initial context sent')
    }

    socket.value.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        await handleSocketMessage(data)
      } catch (err) {
        console.error('❌ Error parsing socket message:', err)
        console.error('Raw message:', event.data)
      }
    }

    socket.value.onclose = (event) => {
      console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason)
      isConnected.value = false

      if (isInCall.value && event.code !== 1000) { // Don't reconnect if it was a normal close
        console.log('🔄 Attempting to reconnect in 3 seconds...')
        setTimeout(connectWebSocket, 3000)
      }
    }

    socket.value.onerror = (err) => {
      console.error('❌ WebSocket error:', err)
      error.value = 'Connection error. Please check your internet connection and try again.'
    }

  } catch (err) {
    console.error('❌ Error creating WebSocket:', err)
    error.value = 'Failed to establish connection. Please try again.'
    isInCall.value = false
  }
}

const handleSocketMessage = async (data: any) => {
  console.log('📨 Received message:', data.type)

  switch (data.type) {
    case 'connection_ready':
      console.log('✅ WebSocket connection ready:', data.message)
      // Start automatic listening immediately after connection is ready
      setTimeout(async () => {
        await startAutomaticListening()
      }, 500) // Small delay to ensure everything is set up
      break

    case 'transcription':
      console.log('📝 Transcription received:', data.text)
      if (data.text) {
        addMessage('user', data.text)
      }
      break

    case 'ai_response':
      console.log('🤖 AI response received')
      isProcessing.value = false
      if (data.text) {
        addMessage('assistant', data.text)
      }

      // Play audio response if available
      if (data.audio) {
        await playAudioResponse(data.audio)
        // Audio onended callback will handle automatic listening restart
      } else {
        // If no audio, start listening immediately
        setTimeout(async () => {
          await startAutomaticListening()
        }, 100)
      }
      break

    case 'ready_for_speech':
      // AI is ready for next user input - VAD will automatically detect speech
      console.log('🎯 AI ready for speech - VAD is listening')
      isProcessing.value = false
      // No need to manually start listening - VAD handles this automatically
      break

    case 'audio_chunk':
      if (data.audio) {
        await playAudioChunk(data.audio)
      }
      break

    case 'vad_audio_processed':
      console.log('🎯 VAD audio processed successfully')
      isProcessing.value = false
      // Show ready indicator after VAD processing
      setTimeout(() => {
        if (!isSpeaking.value && !isUserSpeaking.value && isConnected.value) {
          isReadyToListen.value = true
        }
      }, 100)
      break

    case 'welcome':
      console.log('👋 Welcome message received')
      isProcessing.value = false
      if (data.message) {
        addMessage('assistant', data.message)
      }
      if (data.audio) {
        await playAudioResponse(data.audio)
        // Audio onended callback will handle automatic listening restart
      } else {
        // If no audio, start listening immediately
        setTimeout(async () => {
          await startAutomaticListening()
        }, 100)
      }
      break

    case 'error':
      console.error('❌ Server error:', data.message)
      error.value = data.message
      isProcessing.value = false
      break

    default:
      console.log('⚠️ Unknown message type:', data.type)
  }
}

const sendMessage = (type: string, data: any) => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify({ type, data }))
  }
}

// Audio Handling
const initializeAudio = async () => {
  try {
    // Initialize Web Audio API
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Initialize Speech Synthesis
    synthesis.value = window.speechSynthesis

    // Request microphone permission
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })

    await setupVoiceActivityDetection()

  } catch (err) {
    console.error('Error initializing audio:', err)
    throw new Error('Microphone access denied. Please allow microphone access to use voice features.')
  }
}

const setupVoiceActivityDetection = async () => {
  // console.log('🔄 Setting up Voice Activity Detection...')
  if (!mediaStream.value) return

  try {
    console.log('🎙️ Setting up Voice Activity Detection...')

    // Create VAD instance with optimized settings based on the reference implementation
    vad.value = await MicVAD.new({

      onSpeechStart: () => {
        console.log('🎙️ VAD: User started speaking')
        isUserSpeaking.value = true
        isReadyToListen.value = false // Hide ready indicator when user starts speaking
        speechStartTime.value = Date.now()

        // Clear any existing silence timeout
        if (silenceTimeout.value) {
          clearTimeout(silenceTimeout.value)
          silenceTimeout.value = null
        }

        // Automatically start listening when user speaks (if conditions are met)
        if (!isListening.value && !isProcessing.value && isConnected.value && !isSpeaking.value) {
          console.log('🎙️ Auto-starting listening due to speech detection')
          startListening()
        }
      },

      onSpeechEnd: async (audioData: Float32Array) => {
        console.log('🛑 VAD: User stopped speaking, received audio samples:', audioData.length)
        isUserSpeaking.value = false

        // Process the audio data directly if we have it
        if (audioData && audioData.length > 0) {
          console.log('📤 Processing audio data from VAD onSpeechEnd')
          await processVADAudio(audioData)
        }

        // Set a timeout to stop listening after silence (for responsive conversation)
        silenceTimeout.value = setTimeout(() => {
          if (isListening.value && !isUserSpeaking.value && !isSpeaking.value) {
            console.log('🛑 Auto-stopping listening due to silence')
            stopListening()
            // After stopping, show ready indicator again
            setTimeout(() => {
              if (!isProcessing.value && !isSpeaking.value && isConnected.value) {
                isReadyToListen.value = true
              }
            }, 100)
          }
        }, 800) // Stop after 0.8 seconds of silence for natural conversation flow
      },

      onVADMisfire: () => {
        console.log('⚠️ VAD: Misfire detected (brief noise)')
        // Don't start/stop on brief noise
      },

      stream: mediaStream.value,

      // VAD configuration optimized for conversation (from reference implementation)
      ortConfig: (ort) => {
        ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/"
      },

      // More precise settings for natural conversation
      preSpeechPadFrames: 1, // Minimal padding to reduce false positives
      positiveSpeechThreshold: 0.5, // Slightly higher threshold for cleaner detection
      negativeSpeechThreshold: 0.35, // Balanced threshold for ending speech
      minSpeechFrames: 4, // Require at least 4 frames to avoid noise
      redemptionFrames: 8, // Allow brief pauses within speech
      frameSamples: 1536 // Standard frame size
    })

    console.log('✅ VAD initialized successfully with optimized conversation settings')

    // Don't start VAD immediately - let the centralized management handle it
    vadActive.value = false // Ensure state is properly initialized
    console.log('🎙️ VAD created - will be started when appropriate by centralized management')

    // Add failsafe timeout to reset speaking states if they get stuck
    setInterval(() => {
      if (isSpeaking.value && !isConnected.value) {
        console.log('🔄 Failsafe: Resetting stuck speaking state')
        isSpeaking.value = false
      }
    }, 15000) // Check every 15 seconds

  } catch (err) {
    console.error('❌ Error initializing VAD:', err)
    // Fallback to basic volume detection
    console.log('🔄 Falling back to basic volume detection')
    setupBasicVolumeDetection()
  }
}

// Centralized VAD management - ensures VAD only starts when appropriate
const ensureVADActive = async () => {
  // Only start VAD when conditions are right and AI is not speaking
  if (!vad.value || !isInCall.value || isProcessing.value || isSpeaking.value || vadActive.value) {
    console.log('🚫 VAD activation blocked:', {
      hasVAD: !!vad.value,
      isInCall: isInCall.value,
      isProcessing: isProcessing.value,
      isSpeaking: isSpeaking.value,
      vadActive: vadActive.value
    })
    return
  }

  try {
    console.log('🔄 Ensuring VAD is active after AI stops talking...')
    await vad.value.start()
    vadActive.value = true
    console.log('✅ VAD activated and ready to listen')

    // Show ready indicator
    setTimeout(() => {
      if (!isProcessing.value && !isUserSpeaking.value && isConnected.value && isInCall.value) {
        isReadyToListen.value = true
      }
    }, 200)
  } catch (err) {
    console.log('⚠️ VAD start error (may already be active):', err)
    vadActive.value = true // Mark as active even if already started
  }
}

// Stop VAD when needed
const pauseVAD = async () => {
  if (!vad.value || !vadActive.value) return

  try {
    console.log('🛑 Pausing VAD...')
    await vad.value.pause()
    vadActive.value = false
    console.log('✅ VAD paused')
  } catch (err) {
    console.log('⚠️ VAD pause error:', err)
    vadActive.value = false // Reset state regardless
  }
}

// Start automatic listening - works with both VAD and fallback
const startAutomaticListening = async () => {
  if (!isConnected.value || isProcessing.value || isSpeaking.value) {
    console.log('🚫 Conditions not met for starting automatic listening:', {
      isConnected: isConnected.value,
      isProcessing: isProcessing.value,
      isSpeaking: isSpeaking.value
    })
    return
  }

  try {
    console.log('🎙️ Starting automatic listening mode...')

    if (vad.value) {
      // Use centralized VAD management to prevent multiple starts
      await ensureVADActive()
    } else {
      // Use fallback volume detection
      console.log('✅ Using volume-based automatic listening')
      // The fallback system will handle automatic detection
    }

    // Set the UI state to show we're ready for speech
    isListening.value = false // Not manually listening, but ready for auto-detection
    if (!vadActive.value) {
      isReadyToListen.value = true // Show clear indicator that system is ready
    }

  } catch (err) {
    console.error('❌ Error starting automatic listening:', err)
    // Try fallback method
    setupBasicVolumeDetection()
  }
}

// Process VAD audio data (inspired by reference implementation)
const processVADAudio = async (audioData: Float32Array) => {
  try {
    console.log('🔄 Processing VAD audio data, samples:', audioData.length)

    // Convert Float32Array to WAV format (based on reference implementation)
    const wavBlob = float32ArrayToWav(audioData)
    console.log('📦 Converted to WAV, size:', wavBlob.size)

    if (wavBlob.size === 0) {
      console.warn('⚠️ Empty audio data, skipping processing')
      return
    }

    // Convert blob to array buffer for WebSocket transmission
    const arrayBuffer = await wavBlob.arrayBuffer()
    const audioArray = Array.from(new Uint8Array(arrayBuffer))

    // Send to WebSocket for processing
    if (socket.value?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending VAD audio to server')
      isProcessing.value = true
      sendMessage('vad_audio', { audio: audioArray })
    } else {
      console.warn('⚠️ WebSocket not ready for VAD audio transmission')
    }

  } catch (err) {
    console.error('❌ Error processing VAD audio:', err)
  }
}

// Convert Float32Array to WAV format (from reference implementation)
const float32ArrayToWav = (audioData: Float32Array, sampleRate = 16000): Blob => {
  const numFrames = audioData.length
  const numChannels = 1
  const bytesPerSample = 2 // 16-bit
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = numFrames * blockAlign

  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  // WAV header
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // audio format (PCM)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true) // bits per sample

  // "data" sub-chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // Write audio data
  const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
  }

  floatTo16BitPCM(view, 44, audioData)

  return new Blob([buffer], { type: 'audio/wav' })
}

// Helper function to write string to DataView
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

// Fallback basic volume detection for when VAD fails - fully automatic
const setupBasicVolumeDetection = () => {
  if (!audioContext.value || !mediaStream.value) return

  console.log('🔄 Setting up basic volume detection fallback with automatic conversation')

  const source = audioContext.value.createMediaStreamSource(mediaStream.value)
  const analyser = audioContext.value.createAnalyser()
  const dataArray = new Uint8Array(analyser.frequencyBinCount)

  source.connect(analyser)

  let isCurrentlySpeaking = false
  let silenceStartTime = 0
  const VOLUME_THRESHOLD = 20 // Lower threshold for better sensitivity
  const SPEECH_MIN_DURATION = 200 // Minimum speech duration before starting to listen
  const SILENCE_DURATION = 1200 // Silence duration before stopping

  const checkVolume = () => {
    if (!isInCall.value) return

    analyser.getByteFrequencyData(dataArray)

    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length
    volumeLevel.value = Math.min(100, average * 2)

    const isSpeakingNow = average > VOLUME_THRESHOLD
    const currentTime = Date.now()

    if (isSpeakingNow && !isCurrentlySpeaking && !isSpeaking.value) {
      // User started speaking
      isCurrentlySpeaking = true
      isUserSpeaking.value = true
      isReadyToListen.value = false // Hide ready indicator
      speechStartTime.value = currentTime
      console.log('📢 Basic VAD: User started speaking')

      // Start listening after minimum speech duration
      setTimeout(() => {
        if (isCurrentlySpeaking && !isListening.value && !isProcessing.value && isConnected.value && !isSpeaking.value) {
          console.log('🎙️ Basic VAD: Auto-starting listening')
          startListening()
        }
      }, SPEECH_MIN_DURATION)

    } else if (!isSpeakingNow && isCurrentlySpeaking) {
      // User stopped speaking - start silence timer
      silenceStartTime = currentTime
      isCurrentlySpeaking = false
      isUserSpeaking.value = false
      console.log('🛑 Basic VAD: User stopped speaking')

      // Show ready indicator after brief delay
      setTimeout(() => {
        if (!isProcessing.value && !isSpeaking.value && !isListening.value && isConnected.value) {
          isReadyToListen.value = true
        }
      }, 500)

    } else if (!isSpeakingNow && !isCurrentlySpeaking && isListening.value) {
      // Check if silence duration exceeded
      if (currentTime - silenceStartTime > SILENCE_DURATION) {
        console.log('🛑 Basic VAD: Auto-stopping listening due to silence')
        stopListening()
      }
    }

    requestAnimationFrame(checkVolume)
  }

  checkVolume()
}

const startListening = async () => {
  if (!mediaStream.value || !socket.value) return

  try {
    isListening.value = true
    isProcessing.value = false
    isReadyToListen.value = false // Hide ready indicator when actively listening

    // Start streaming audio to WebSocket
    const mediaRecorder = new MediaRecorder(mediaStream.value, {
      mimeType: 'audio/webm;codecs=opus'
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && socket.value?.readyState === WebSocket.OPEN) {
        // Convert blob to array buffer and send
        event.data.arrayBuffer().then(buffer => {
          sendMessage('audio_chunk', {
            audio: Array.from(new Uint8Array(buffer))
          })
        })
      }
    }

    mediaRecorder.start(100) // Send chunks every 100ms

    // Store reference for stopping
    ;(window as any).currentMediaRecorder = mediaRecorder

  } catch (err) {
    console.error('Error starting listening:', err)
    error.value = 'Failed to start voice recognition'
    isListening.value = false
  }
}

const stopListening = () => {
  isListening.value = false
  isProcessing.value = true

  const mediaRecorder = (window as any).currentMediaRecorder
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  // Signal end of speech
  sendMessage('end_speech', {})
}

// Note: toggleListening is no longer needed since conversation is fully automatic
// VAD handles all speech detection and the conversation flows naturally

const playAudioResponse = async (audioData: string | number[]) => {
  try {
    console.log('🔊 Starting audio playback, setting isSpeaking to true')
    isSpeaking.value = true
    isReadyToListen.value = false // Hide ready indicator during AI speech

    // Pause VAD/listening when AI starts speaking to prevent interference
    if (vad.value && vadActive.value) {
      console.log('⏸️ Pausing VAD during AI speech to prevent interference')
      await pauseVAD()
    }

    // Stop any active listening when AI starts speaking
    if (isListening.value) {
      console.log('⏸️ Stopping active listening during AI speech')
      stopListening()
    }

    let audioBuffer: ArrayBuffer

    if (typeof audioData === 'string') {
      // Base64 audio data
      const binaryString = atob(audioData)
      audioBuffer = new ArrayBuffer(binaryString.length)
      const bytes = new Uint8Array(audioBuffer)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
    } else {
      // Array of bytes
      audioBuffer = new Uint8Array(audioData).buffer
    }

    if (audioContext.value) {
      const decodedAudio = await audioContext.value.decodeAudioData(audioBuffer)
      const source = audioContext.value.createBufferSource()
      source.buffer = decodedAudio
      source.connect(audioContext.value.destination)

      console.log('🎵 Audio buffer created and connected, duration:', decodedAudio.duration, 'seconds')

      // Enhanced onended callback with better error handling
      source.onended = async () => {
        console.log('🎵 Audio source onended callback triggered')
        isSpeaking.value = false
        console.log('🎤 AI finished speaking - ready for user input')

        // Use centralized VAD management to restart after AI stops talking
        if (vad.value && isInCall.value) {
          try {
            // Small delay to ensure audio system is fully reset
            setTimeout(async () => {
              console.log('🔄 Restarting VAD after AI finishes speaking...')

              // First pause VAD to ensure clean state
              await pauseVAD()

              // Small delay before restart
              setTimeout(async () => {
                // Use centralized function to restart VAD
                await ensureVADActive()
              }, 100)
            }, 200) // Delay for audio system cleanup

          } catch (err) {
            console.log('VAD restart setup error:', err)
          }
        } else {
          console.log('Cannot restart VAD:', {
            hasVAD: !!vad.value,
            isInCall: isInCall.value
          })

          // Try to reinitialize VAD if it's missing but we're in a call
          if (isInCall.value && !vad.value && mediaStream.value) {
            console.log('🔄 VAD missing but in call - attempting reinitialization...')
            try {
              await setupVoiceActivityDetection()
              // After reinitializing, start it
              await ensureVADActive()
            } catch (reinitErr) {
              console.error('❌ VAD reinitialization failed:', reinitErr)
              setupBasicVolumeDetection()
            }
          }

          // Still show ready indicator if conditions are met
          setTimeout(() => {
            if (!isProcessing.value && !isUserSpeaking.value && isConnected.value) {
              isReadyToListen.value = true
            }
          }, 100)
        }
      }

      // Add error handler for audio source
      (source as any).onerror = (err:any) => {
        console.error('🔴 Audio source error:', err)
        isSpeaking.value = false
        if (!isProcessing.value && !isUserSpeaking.value && isConnected.value) {
          isReadyToListen.value = true
        }
      }

      source.start()
      console.log('🎵 Audio playback started')

      // Failsafe timeout to reset speaking state if onended doesn't fire
      setTimeout(() => {
        if (isSpeaking.value) {
          console.log('⏰ Failsafe: Audio playback timeout, resetting speaking state')
          isSpeaking.value = false
          if (!isProcessing.value && !isUserSpeaking.value && isConnected.value) {
            isReadyToListen.value = true
          }
        }
      }, (decodedAudio.duration + 2) * 1000) // Duration + 2 seconds buffer

    } else {
      console.error('❌ No audio context available for playback')
      isSpeaking.value = false
      if (!isProcessing.value && !isUserSpeaking.value && isConnected.value) {
        isReadyToListen.value = true
      }
    }
  } catch (err) {
    console.error('Error playing audio:', err)
    isSpeaking.value = false
    if (!isProcessing.value && !isUserSpeaking.value && isConnected.value) {
      isReadyToListen.value = true
    }
  }
}

const playAudioChunk = async (audioData: string | number[]) => {
  // Ensure listening is paused during audio chunk playback
  if (vad.value && vadActive.value) {
    console.log('⏸️ Pausing VAD during audio chunk playback')
    await pauseVAD()
  }

  if (isListening.value) {
    console.log('⏸️ Stopping active listening during audio chunk')
    stopListening()
  }

  // Handle streaming audio chunks
  await playAudioResponse(audioData)
}

// UI Helpers
const addMessage = (type: 'user' | 'assistant', text: string) => {
  conversation.value.push({
    type,
    text,
    timestamp: new Date()
  })

  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (conversationContainer.value) {
    conversationContainer.value.scrollTop = conversationContainer.value.scrollHeight
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const clearError = () => {
  error.value = ''
}

const clearConversation = () => {
  conversation.value = []
}

// Lifecycle - Don't auto-connect anymore
onMounted(() => {
  // Don't automatically initialize audio or connect WebSocket
  // User needs to click "Start AI Call" button

  // Set up periodic state monitoring to prevent stuck states (inspired by reference implementation)
  const stateMonitor = setInterval(() => {
    // Check for stuck speaking state
    if (isSpeaking.value && !isInCall.value) {
      console.log('🔄 State Monitor: Resetting stuck speaking state (not in call)')
      isSpeaking.value = false
    }

    // Check for stuck processing state
    if (isProcessing.value && !isConnected.value) {
      console.log('🔄 State Monitor: Resetting stuck processing state (not connected)')
      isProcessing.value = false
    }

    // Check for stuck listening state
    if (isListening.value && !isInCall.value) {
      console.log('🔄 State Monitor: Resetting stuck listening state (not in call)')
      isListening.value = false
    }

    // Reset VAD active state if not in call
    if (vadActive.value && !isInCall.value) {
      console.log('🔄 State Monitor: Resetting VAD active state (not in call)')
      vadActive.value = false
    }

    // Auto-recovery for ready state
    if (isInCall.value && isConnected.value &&
        !isSpeaking.value && !isProcessing.value && !isUserSpeaking.value && !isListening.value &&
        !isReadyToListen.value) {
      console.log('🔄 State Monitor: Auto-recovering ready state')
      isReadyToListen.value = true
    }
  }, 10000) // Check every 10 seconds

  // Store the interval ID for cleanup
  ;(window as any).stateMonitorInterval = stateMonitor
})

onUnmounted(() => {
  // Clean up if user navigates away while in call
  endCall()

  // Clean up state monitor
  if ((window as any).stateMonitorInterval) {
    clearInterval((window as any).stateMonitorInterval)
  }
})
</script>

<style scoped>
/* Custom animations for better UX */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
  60% {
    transform: translateY(-3px);
  }
}

/* Enhanced resonance animation for AI speaking */
@keyframes resonance-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes avatar-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.3);
  }
}

/* Apply custom resonance animation when AI is speaking */
.ai-speaking-avatar {
  animation: avatar-glow 2s ease-in-out infinite;
}

.ai-speaking-avatar .resonance-ring {
  animation: resonance-ring 1.5s ease-out infinite;
}

.ai-speaking-avatar .resonance-ring:nth-child(2) {
  animation-delay: 0.2s;
}

.ai-speaking-avatar .resonance-ring:nth-child(3) {
  animation-delay: 0.4s;
}

.ai-speaking-avatar .resonance-ring:nth-child(4) {
  animation-delay: 0.6s;
}

/* Smooth transitions for avatar states */
.avatar-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-container img {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ready state gentle pulse */
@keyframes ready-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(34, 197, 94, 0.5);
  }
}

.ready-to-listen {
  animation: ready-pulse 3s ease-in-out infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s ease;
}

.transition-colors {
  transition: color, background-color, border-color 0.15s ease;
}

/* Pulse animation for active states */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
