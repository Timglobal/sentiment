<template>
  <DashboardLayout>
    <div class="max-w-4xl mx-auto">
      <div class="space-y-6">
        <!-- Header Section -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">AI Voice Assistant</h2>
          <p class="text-gray-600">Have a natural conversation with your AI assistant</p>
        </div>

        <!-- Voice Chat Interface -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Main Chat Area -->
          <div class="lg:col-span-2">
            <Card>
              <CardContent class="p-0">
                <!-- Chat Messages -->
                <div 
                  ref="messagesContainer"
                  class="h-96 overflow-y-auto p-6 space-y-4 border-b border-gray-200"
                >
                  <div
                    v-for="message in messages"
                    :key="message.id"
                    :class="[
                      'flex',
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    ]"
                  >
                    <div
                      :class="[
                        'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      ]"
                    >
                      <div class="flex items-start space-x-2">
                        <component 
                          :is="message.sender === 'user' ? User : Bot" 
                          class="w-4 h-4 mt-1 flex-shrink-0" 
                        />
                        <div class="flex-1">
                          <p class="text-sm">{{ message.text }}</p>
                          <p class="text-xs opacity-75 mt-1">
                            {{ formatTime(message.timestamp) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Loading indicator -->
                  <div v-if="isProcessing" class="flex justify-start">
                    <div class="bg-gray-100 text-gray-900 max-w-xs px-4 py-2 rounded-lg">
                      <div class="flex items-center space-x-2">
                        <Bot class="w-4 h-4" />
                        <div class="flex space-x-1">
                          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Voice Controls -->
                <div class="p-6">
                  <div class="flex items-center justify-center space-x-4">
                    <!-- Record/Call Button -->
                    <button
                      @click="toggleConversation"
                      :disabled="isProcessing && !isInConversation"
                      :class="[
                        'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
                        isInConversation
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      ]"
                    >
                      <component :is="isInConversation ? Square : Mic" class="w-6 h-6" />
                    </button>

                    <!-- Voice Activity Visualization -->
                    <div v-if="isInConversation" class="flex items-center space-x-1">
                      <div
                        v-for="i in 5"
                        :key="i"
                        :class="[
                          'w-1 rounded-full transition-all duration-150',
                          isUserSpeaking ? 'bg-green-500' : 'bg-gray-300',
                          isUserSpeaking ? `h-${Math.floor(Math.random() * 8) + 4}` : 'h-2'
                        ]"
                        :style="{
                          animationDelay: `${i * 0.1}s`,
                          animation: isUserSpeaking ? 'pulse 1s infinite' : 'none'
                        }"
                      ></div>
                    </div>

                    <!-- Conversation Status -->
                    <div v-if="isInConversation && !isUserSpeaking && !isProcessing" class="flex items-center space-x-2">
                      <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span class="text-xs text-gray-500">AI is listening...</span>
                    </div>

                    <!-- Clear Chat -->
                    <button
                      @click="clearChat"
                      class="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Clear chat"
                    >
                      <Trash2 class="w-5 h-5" />
                    </button>
                  </div>

                  <!-- Status Text -->
                  <div class="text-center mt-4">
                    <p class="text-sm text-gray-600">
                      {{ getStatusText() }}
                    </p>
                    <p v-if="isInConversation && !isUserSpeaking && !isProcessing" class="text-xs text-blue-600 mt-1">
                      Say "End the conversation" to stop
                    </p>
                  </div>

                  <!-- Transcript Display -->
                  <div v-if="currentTranscript" class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-700">
                      <span class="font-medium">Transcript:</span> {{ currentTranscript }}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Side Panel -->
          <div class="space-y-6">
            <!-- Voice Settings -->
            <Card>
              <CardContent class="p-4">
                <h3 class="font-semibold text-gray-900 mb-4">Voice Settings</h3>
                <div class="space-y-4">
                  <div>
                    <Label class="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </Label>
                    <select
                      v-model="selectedLanguage"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label class="block text-sm font-medium text-gray-700 mb-2">
                      AI Voice
                    </Label>
                    <select
                      v-model="selectedVoice"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="alloy">Alloy</option>
                      <option value="echo">Echo</option>
                      <option value="fable">Fable</option>
                      <option value="onyx">Onyx</option>
                      <option value="nova">Nova</option>
                      <option value="shimmer">Shimmer</option>
                    </select>
                  </div>

                  <div>
                    <Label class="block text-sm font-medium text-gray-700 mb-2">
                      Auto-play AI responses
                    </Label>
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="autoPlayResponses"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-600">Enable voice responses</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Quick Actions -->
            <Card>
              <CardContent class="p-4">
                <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div class="space-y-2">
                  <button
                    v-for="action in quickActions"
                    :key="action.id"
                    @click="sendQuickMessage(action.message)"
                    class="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div class="flex items-center space-x-2">
                      <component :is="action.icon" class="w-4 h-4 text-gray-600" />
                      <span class="text-sm font-medium text-gray-700">{{ action.label }}</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <!-- Conversation Stats -->
            <Card>
              <CardContent class="p-4">
                <h3 class="font-semibold text-gray-900 mb-4">Session Stats</h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Messages</span>
                    <Badge variant="secondary">{{ messages.length }}</Badge>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Duration</span>
                    <Badge variant="secondary">{{ formatDuration(sessionDuration) }}</Badge>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Status</span>
                    <Badge :variant="isInConversation ? 'destructive' : 'default'">
                      {{ isInConversation ? 'In Call' : 'Ready' }}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Label from '@/components/ui/Label.vue'
import Badge from '@/components/ui/Badge.vue'
import { Mic, Square, Bot, User, Trash2, MessageSquare, HelpCircle, Settings, BarChart3 } from 'lucide-vue-next'

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: number
  audioUrl?: string
}

interface QuickAction {
  id: string
  label: string
  message: string
  icon: any
}

// Reactive state
const messages = ref<Message[]>([])
const isRecording = ref(false)
const isProcessing = ref(false)
const isInConversation = ref(false)
const isListening = ref(false)
const currentTranscript = ref('')
const selectedLanguage = ref('en-US')
const selectedVoice = ref('alloy')
const autoPlayResponses = ref(true)
const sessionStartTime = ref(Date.now())
const messagesContainer = ref<HTMLElement>()

// Media recorder and voice activity detection
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let silenceTimer: number | null = null
let voiceActivityDetection: number | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let microphone: MediaStreamAudioSourceNode | null = null
let isUserSpeaking = ref(false)
let lastSpeechTime = 0
const SILENCE_THRESHOLD = -50 // dB threshold for silence detection
const SILENCE_DURATION = 2000 // 2 seconds of silence before stopping

// Quick actions
const quickActions: QuickAction[] = [
  {
    id: 'feedback',
    label: 'Ask about feedback',
    message: 'How can I provide better feedback to my team?',
    icon: MessageSquare
  },
  {
    id: 'analytics',
    label: 'Explain analytics',
    message: 'Can you help me understand our performance analytics?',
    icon: BarChart3
  },
  {
    id: 'help',
    label: 'General help',
    message: 'What can you help me with?',
    icon: HelpCircle
  },
  {
    id: 'settings',
    label: 'Account settings',
    message: 'How do I update my account settings?',
    icon: Settings
  }
]

// Computed properties
const sessionDuration = computed(() => {
  return Date.now() - sessionStartTime.value
})

// Methods
const toggleConversation = async () => {
  if (isInConversation.value) {
    endConversation()
  } else {
    await startConversation()
  }
}

const startConversation = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    isInConversation.value = true
    await startContinuousListening(stream)
    
    // Add conversation start message
    const startMessage: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      text: 'Hi! I\'m ready to chat. What would you like to talk about?',
      timestamp: Date.now()
    }
    messages.value.push(startMessage)
    scrollToBottom()
    
    if (autoPlayResponses.value) {
      speakText(startMessage.text)
    }
  } catch (error) {
    console.error('Error accessing microphone:', error)
    alert('Error accessing microphone. Please check your permissions.')
  }
}

const endConversation = () => {
  isInConversation.value = false
  isListening.value = false
  isUserSpeaking.value = false
  
  // Stop all timers
  if (silenceTimer) {
    clearTimeout(silenceTimer)
    silenceTimer = null
  }
  if (voiceActivityDetection) {
    clearInterval(voiceActivityDetection)
    voiceActivityDetection = null
  }
  
  // Clean up audio context
  if (microphone) {
    microphone.disconnect()
    microphone = null
  }
  if (analyser) {
    analyser.disconnect()
    analyser = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  
  // Stop media recorder
  if (mediaRecorder) {
    try {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Error stopping recorder:', error)
    }
    mediaRecorder = null
  }
  
  currentTranscript.value = ''
  
  // Add conversation end message
  const endMessage: Message = {
    id: Date.now().toString(),
    sender: 'ai',
    text: 'Conversation ended. Thank you for chatting with me!',
    timestamp: Date.now()
  }
  messages.value.push(endMessage)
  scrollToBottom()
}

const startContinuousListening = async (stream: MediaStream) => {
  try {
    // Set up audio context for voice activity detection
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    microphone = audioContext.createMediaStreamSource(stream)
    
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.3
    microphone.connect(analyser)
    
    // Set up media recorder
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    isListening.value = true

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      if (audioChunks.length > 0 && isInConversation.value) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await processConversationAudio(audioBlob)
      }
      audioChunks = []
      
      // Continue listening if still in conversation and not processing
      if (isInConversation.value && !isProcessing.value) {
        setTimeout(() => {
          if (isInConversation.value) {
            startNextListeningSegment(stream)
          }
        }, 500)
      }
    }

    // Start real-time voice activity detection
    startRealTimeVoiceDetection()
    
    // Start recording
    mediaRecorder.start()
    
  } catch (error) {
    console.error('Error setting up audio context:', error)
    // Fallback to simple timer-based detection
    startSimpleVoiceDetection()
    mediaRecorder = new MediaRecorder(stream)
    mediaRecorder.start()
  }
}

const startNextListeningSegment = (stream: MediaStream) => {
  if (!isInConversation.value) return
  
  try {
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    isListening.value = true

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      if (audioChunks.length > 0 && isInConversation.value) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await processConversationAudio(audioBlob)
      }
      audioChunks = []
      
      // Continue listening if still in conversation
      if (isInConversation.value && !isProcessing.value) {
        setTimeout(() => {
          if (isInConversation.value) {
            startNextListeningSegment(stream)
          }
        }, 500)
      }
    }

    mediaRecorder.start()
  } catch (error) {
    console.error('Error starting next segment:', error)
  }
}

const startRealTimeVoiceDetection = () => {
  if (!analyser || !isInConversation.value) return
  
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  
  const detectVoice = () => {
    if (!isInConversation.value || !analyser) return
    
    analyser.getByteFrequencyData(dataArray)
    
    // Calculate average volume
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i]
    }
    const average = sum / bufferLength
    
    // Convert to decibels (approximate)
    const decibels = 20 * Math.log10(average / 255)
    
    const currentTime = Date.now()
    const isSpeaking = decibels > SILENCE_THRESHOLD
    
    if (isSpeaking) {
      if (!isUserSpeaking.value) {
        isUserSpeaking.value = true
        console.log('User started speaking')
      }
      lastSpeechTime = currentTime
      
      // Clear any existing silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        silenceTimer = null
      }
    } else if (isUserSpeaking.value) {
      // User was speaking but now there's silence
      const silenceDuration = currentTime - lastSpeechTime
      
      if (silenceDuration > 500 && !silenceTimer) { // 500ms buffer
        // Start silence timer
        silenceTimer = setTimeout(() => {
          if (isInConversation.value && isListening.value) {
            console.log('Detected end of speech, stopping recording')
            isUserSpeaking.value = false
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop()
            }
          }
        }, SILENCE_DURATION - 500) // Adjust for the buffer
      }
    }
    
    // Continue monitoring
    if (isInConversation.value) {
      requestAnimationFrame(detectVoice)
    }
  }
  
  detectVoice()
}

const startSimpleVoiceDetection = () => {
  // Fallback: simple timer-based detection for browsers without Web Audio API
  voiceActivityDetection = setInterval(() => {
    if (!isInConversation.value) return
    
    const currentTime = Date.now()
    
    // Simulate speech detection with random periods
    if (Math.random() > 0.7 && !isProcessing.value && !isUserSpeaking.value) {
      isUserSpeaking.value = true
      lastSpeechTime = currentTime
      console.log('Simulated: User started speaking')
      
      // Simulate speech duration (2-8 seconds)
      const speechDuration = 2000 + Math.random() * 6000
      setTimeout(() => {
        if (isUserSpeaking.value && isInConversation.value) {
          console.log('Simulated: User stopped speaking')
          isUserSpeaking.value = false
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
          }
        }
      }, speechDuration)
    }
  }, 1000)
}

const processConversationAudio = async (audioBlob: Blob) => {
  if (!isInConversation.value) return
  
  isProcessing.value = true
  isListening.value = false
  isUserSpeaking.value = false
  
  // Clear any remaining silence timer
  if (silenceTimer) {
    clearTimeout(silenceTimer)
    silenceTimer = null
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate transcription
  const transcript = await simulateRealTimeTranscription()
  
  // Skip processing if no meaningful audio (very short recordings)
  if (audioBlob.size < 1000) {
    console.log('Audio too short, skipping processing')
    isProcessing.value = false
    return
  }
  
  // Check for conversation end commands
  if (transcript.toLowerCase().includes('end the conversation') || 
      transcript.toLowerCase().includes('stop') ||
      transcript.toLowerCase().includes('goodbye') ||
      transcript.toLowerCase().includes('bye')) {
    endConversation()
    return
  }
  
  // Add user message
  const userMessage: Message = {
    id: Date.now().toString(),
    sender: 'user',
    text: transcript,
    timestamp: Date.now(),
    audioUrl: URL.createObjectURL(audioBlob)
  }
  
  messages.value.push(userMessage)
  scrollToBottom()
  
  // Generate and add AI response
  const aiResponse = await generateAIResponse(transcript)
  const aiMessage: Message = {
    id: (Date.now() + 1).toString(),
    sender: 'ai',
    text: aiResponse,
    timestamp: Date.now()
  }
  
  messages.value.push(aiMessage)
  scrollToBottom()
  
  if (autoPlayResponses.value && isInConversation.value) {
    await speakText(aiResponse)
  }
  
  isProcessing.value = false
  
  // Reset for next listening session
  console.log('Ready for next speech input')
}

const simulateRealTimeTranscription = async (): Promise<string> => {
  const transcripts = [
    'Hello, how can you help me?',
    'I need assistance with my team feedback',
    'Can you explain the analytics dashboard?',
    'What are the best practices for management?',
    'How do I improve team collaboration?',
    'Tell me about our performance metrics',
    'What should I focus on this week?',
    'How can I motivate my team better?',
    'End the conversation'
  ]
  
  return transcripts[Math.floor(Math.random() * transcripts.length)]
}

const generateAIResponse = async (userText: string): Promise<string> => {
  // Simulate AI responses based on user input
  const responses = {
    feedback: [
      "Great question! For effective feedback, focus on being specific, timely, and constructive. Always highlight what's working well before suggesting improvements.",
      "Feedback should be a two-way conversation. Ask questions and listen actively to understand their perspective better."
    ],
    analytics: [
      "I can help you understand your analytics! The dashboard shows key performance indicators, sentiment trends, and department comparisons. What specific metric would you like to explore?",
      "Analytics help you make data-driven decisions. Look for patterns in the sentiment trends and identify areas where your team is performing exceptionally well."
    ],
    help: [
      "I'm here to assist with feedback management, team analytics, performance insights, and general workplace questions. What would you like to explore?",
      "I can help you with team management, understanding your dashboard metrics, improving communication, and much more!"
    ],
    default: [
      "That's an interesting point! Let me help you think through that. Could you provide a bit more context?",
      "I understand. Based on what you've shared, here are some suggestions that might help.",
      "Great question! This is something many team leaders face. Let's explore some effective approaches."
    ]
  }
  
  const lowerText = userText.toLowerCase()
  let responseArray = responses.default
  
  if (lowerText.includes('feedback') || lowerText.includes('team')) {
    responseArray = responses.feedback
  } else if (lowerText.includes('analytics') || lowerText.includes('dashboard') || lowerText.includes('data')) {
    responseArray = responses.analytics
  } else if (lowerText.includes('help') || lowerText.includes('what can you')) {
    responseArray = responses.help
  }
  
  return responseArray[Math.floor(Math.random() * responseArray.length)]
}

const speakText = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        resolve()
      }
      
      utterance.onerror = () => {
        resolve()
      }
      
      speechSynthesis.speak(utterance)
    } else {
      resolve()
    }
  })
}

const sendQuickMessage = async (message: string) => {
  // If not in conversation, start one first
  if (!isInConversation.value) {
    await startConversation()
    // Wait a moment for the conversation to initialize
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const userMessage: Message = {
    id: Date.now().toString(),
    sender: 'user',
    text: message,
    timestamp: Date.now()
  }
  
  messages.value.push(userMessage)
  scrollToBottom()
  
  isProcessing.value = true
  
  const aiResponse = await generateAIResponse(message)
  const aiMessage: Message = {
    id: (Date.now() + 1).toString(),
    sender: 'ai',
    text: aiResponse,
    timestamp: Date.now()
  }
  
  messages.value.push(aiMessage)
  scrollToBottom()
  
  if (autoPlayResponses.value && isInConversation.value) {
    await speakText(aiResponse)
  }
  
  isProcessing.value = false
}

const clearChat = () => {
  if (isInConversation.value) {
    endConversation()
  }
  messages.value = []
  sessionStartTime.value = Date.now()
  currentTranscript.value = ''
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const getStatusText = () => {
  if (isProcessing.value) return 'AI is thinking...'
  if (isInConversation.value && isUserSpeaking.value) return 'Listening to you...'
  if (isInConversation.value && isListening.value) return 'Ready - speak when you want to talk'
  if (isInConversation.value) return 'In conversation - I\'ll detect when you speak'
  return 'Click the microphone to start a conversation'
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// Lifecycle
onMounted(() => {
  // Add welcome message
  const welcomeMessage: Message = {
    id: 'welcome',
    sender: 'ai',
    text: 'Hello! I\'m your AI assistant. Click the green microphone to start a conversation. I\'ll automatically detect when you start and stop speaking - no need to press buttons while talking! Say "End the conversation" when you\'re done.',
    timestamp: Date.now()
  }
  messages.value.push(welcomeMessage)
})

onUnmounted(() => {
  if (isInConversation.value) {
    endConversation()
  }
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
