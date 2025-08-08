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
                <div class="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300"
                     :class="{
                       'bg-green-100 border-4 border-green-300 shadow-lg animate-pulse': isInCall && (isListening || isUserSpeaking),
                       'bg-blue-100 border-4 border-blue-300 shadow-lg animate-pulse': isInCall && isSpeaking,
                       'bg-yellow-100 border-4 border-yellow-300 shadow-lg': isInCall && isProcessing,
                       'bg-gray-100 border-4 border-gray-200': !isInCall,
                       'bg-red-100 border-4 border-red-300': isInCall && !isConnected,
                       'bg-purple-100 border-4 border-purple-300 shadow-md': isInCall && vad && !isUserSpeaking && !isListening
                     }">
                  <Bot class="w-16 h-16" :class="{
                    'text-green-600': isInCall && (isListening || isUserSpeaking),
                    'text-blue-600': isInCall && isSpeaking,
                    'text-yellow-600': isInCall && isProcessing,
                    'text-gray-500': !isInCall,
                    'text-red-600': isInCall && !isConnected,
                    'text-purple-600': isInCall && vad && !isUserSpeaking && !isListening
                  }" />
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  {{ isInCall ? statusMessage : 'AI Healthcare Assistant' }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ isInCall 
                    ? (isUserSpeaking ? 'You are speaking...' 
                       : isListening ? 'Listening to your voice...' 
                       : isSpeaking ? 'AI is responding...' 
                       : isProcessing ? 'Processing your request...' 
                       : vad ? 'Smart listening active - just start speaking' 
                       : 'Click Talk button to speak')
                    : 'Click the call button to start a voice conversation'
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

                <div v-else class="flex items-center justify-center space-x-4">
                  <Button
                    @click="toggleListening"
                    :disabled="!isConnected"
                    size="lg"
                    :class="{
                      'bg-green-600 hover:bg-green-700 text-white': isListening,
                      'bg-blue-600 hover:bg-blue-700 text-white': !isListening && isConnected,
                      'bg-gray-400 cursor-not-allowed': !isConnected
                    }"
                    class="min-w-[120px] h-12"
                  >
                    <Mic class="w-5 h-5 mr-2" :class="{ 'animate-pulse': isListening }" />
                    {{ isListening ? 'Stop' : 'Talk' }}
                  </Button>

                  <Button
                    @click="endCall"
                    size="lg"
                    class="min-w-[120px] h-12 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <PhoneOff class="w-5 h-5 mr-2" />
                    End Call
                  </Button>
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
                  <li v-if="vad">• <strong>Smart Detection:</strong> Just speak naturally - AI detects when you start/stop</li>
                  <li v-else>• Click "Talk" and speak clearly</li>
                  <li>• Wait for AI response and continue conversation</li>
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
</template><script setup lang="ts">
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
  if (isProcessing.value) return 'AI is thinking...'
  if (isListening.value) return 'Listening to you...'
  if (isSpeaking.value) return 'AI is speaking...'
  return 'Ready to help'
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

  // Clear any timeouts
  if (silenceTimeout.value) {
    clearTimeout(silenceTimeout.value)
    silenceTimeout.value = null
  }

  // Destroy VAD instance
  if (vad.value) {
    try {
      await vad.value.pause()  // Stop VAD detection first
      vad.value.destroy()
      vad.value = null
      console.log('VAD stopped and destroyed')
    } catch (err) {
      console.error('Error destroying VAD:', err)
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
  const wsUrl = `${WS_BASE_URL}/ai-voice-stream?token=${localStorage.getItem('token')}`

  socket.value = new WebSocket(wsUrl)

  socket.value.onopen = () => {
    console.log('WebSocket connected')
    isConnected.value = true
    error.value = ''

    // Send initial context
    sendMessage('init', {
      userRole: userContext.role,
      userName: userContext.name,
      userId: userContext.userId,
      companyName: userContext.companyName
    })
  }

  socket.value.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data)
      await handleSocketMessage(data)
    } catch (err) {
      console.error('Error parsing socket message:', err)
    }
  }

  socket.value.onclose = () => {
    console.log('WebSocket disconnected')
    isConnected.value = false
    if (isInCall.value) {
      setTimeout(connectWebSocket, 3000) // Reconnect after 3 seconds if still in call
    }
  }

  socket.value.onerror = (err) => {
    console.error('WebSocket error:', err)
    error.value = 'Connection error. Retrying...'
  }
}

const handleSocketMessage = async (data: any) => {
  switch (data.type) {
    case 'transcription':
      if (data.text) {
        addMessage('user', data.text)
      }
      break

    case 'ai_response':
      isProcessing.value = false
      if (data.text) {
        addMessage('assistant', data.text)
      }

      // Play audio response if available
      if (data.audio) {
        await playAudioResponse(data.audio)
      }
      break

    case 'audio_chunk':
      if (data.audio) {
        await playAudioChunk(data.audio)
      }
      break

    case 'welcome':
      addMessage('assistant', data.message)
      if (data.audio) {
        await playAudioResponse(data.audio)
      }
      break

    case 'error':
      error.value = data.message
      isProcessing.value = false
      break
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
  if (!mediaStream.value) return

  try {
    // Create VAD instance
    vad.value = await MicVAD.new({
      onSpeechStart: () => {
        console.log('VAD: Speech started')
        isUserSpeaking.value = true
        speechStartTime.value = Date.now()
        
        // Clear any existing silence timeout
        if (silenceTimeout.value) {
          clearTimeout(silenceTimeout.value)
          silenceTimeout.value = null
        }
        
        // Auto-start listening if not already listening
        if (!isListening.value && isConnected.value) {
          startListening()
        }
      },
      
      onSpeechEnd: () => {
        console.log('VAD: Speech ended')
        isUserSpeaking.value = false
        
        // Set a timeout to stop listening after silence
        silenceTimeout.value = setTimeout(() => {
          if (isListening.value && !isUserSpeaking.value) {
            stopListening()
          }
        }, 1500) // Stop after 1.5 seconds of silence
      },
      
      onVADMisfire: () => {
        console.log('VAD: Misfire detected (brief noise)')
        // Don't start/stop on brief noise
      },
      
      stream: mediaStream.value,
      
      // VAD configuration
      ortConfig: (ort) => {
        ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/"
      },
      
      // Sensitivity settings
      preSpeechPadFrames: 1,
      positiveSpeechThreshold: 0.5,
      negativeSpeechThreshold: 0.35,
      minSpeechFrames: 3
    })

    console.log('VAD initialized successfully')
    
    // Start VAD listening
    await vad.value.start()
    console.log('VAD started - ready to detect speech')
    
  } catch (err) {
    console.error('Error initializing VAD:', err)
    // Fallback to basic volume detection
    setupBasicVolumeDetection()
  }
}

// Fallback basic volume detection for when VAD fails
const setupBasicVolumeDetection = () => {
  if (!audioContext.value || !mediaStream.value) return

  const source = audioContext.value.createMediaStreamSource(mediaStream.value)
  const analyser = audioContext.value.createAnalyser()
  const dataArray = new Uint8Array(analyser.frequencyBinCount)

  source.connect(analyser)

  const checkVolume = () => {
    analyser.getByteFrequencyData(dataArray)

    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length
    volumeLevel.value = Math.min(100, average * 2)

    if (isListening.value) {
      requestAnimationFrame(checkVolume)
    }
  }

  checkVolume()
}

const startListening = async () => {
  if (!mediaStream.value || !socket.value) return

  try {
    isListening.value = true
    isProcessing.value = false

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

const toggleListening = () => {
  if (isListening.value) {
    stopListening()
  } else {
    startListening()
  }
}

const playAudioResponse = async (audioData: string | number[]) => {
  try {
    isSpeaking.value = true

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

      source.onended = () => {
        isSpeaking.value = false
      }

      source.start()
    }
  } catch (err) {
    console.error('Error playing audio:', err)
    isSpeaking.value = false
  }
}

const playAudioChunk = async (audioData: string | number[]) => {
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
})

onUnmounted(() => {
  // Clean up if user navigates away while in call
  endCall()
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
