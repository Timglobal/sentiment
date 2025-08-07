<template>
  <UserDashboardLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">AI Assistant</h2>
          <p class="text-gray-600">Voice-powered assistant for {{ auth.user?.role === 'staff' ? 'patient management and feedback' : 'feedback submission' }}</p>
        </div>
        <div class="flex items-center space-x-3">
          <Badge :class="isRecording ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'">
            {{ isRecording ? 'Recording' : 'Ready' }}
          </Badge>
        </div>
      </div>

      <!-- AI Chat Interface -->
      <Card class="h-[500px] flex flex-col">
        <CardContent class="p-0 flex-1 flex flex-col">
          <!-- Chat Header -->
          <div class="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Healthcare AI Assistant</h3>
                <p class="text-sm text-gray-600">{{ connectionStatus }}</p>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div class="flex-1 p-4 overflow-y-auto space-y-4" ref="chatContainer">
            <!-- Welcome Message -->
            <div v-if="messages.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic class="w-8 h-8 text-blue-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Welcome to AI Assistant</h3>
              <p class="text-gray-600 mb-4">
                {{ auth.user?.role === 'staff'
                  ? 'You can use voice commands to update patient records, schedule treatments, or submit feedback.'
                  : 'You can use voice commands to submit feedback about your assigned healthcare staff.'
                }}
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                <div class="p-4 bg-blue-50 rounded-lg">
                  <h4 class="font-medium text-blue-900 mb-2">Voice Commands</h4>
                  <ul class="text-sm text-blue-700 space-y-1">
                    <li v-if="auth.user?.role === 'staff'">• "Update patient record for [name]"</li>
                    <li v-if="auth.user?.role === 'staff'">• "Schedule treatment for [patient]"</li>
                    <li>• "Submit feedback about [person]"</li>
                    <li>• "Show my {{ auth.user?.role === 'staff' ? 'patients' : 'feedback history' }}"</li>
                  </ul>
                </div>
                <div class="p-4 bg-purple-50 rounded-lg">
                  <h4 class="font-medium text-purple-900 mb-2">Quick Actions</h4>
                  <ul class="text-sm text-purple-700 space-y-1">
                    <li>• Click the microphone to start</li>
                    <li>• Speak naturally and clearly</li>
                    <li>• Use "stop" to end recording</li>
                    <li>• Type if voice is unavailable</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Chat Messages -->
            <div v-for="message in messages" :key="message.id" class="flex" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
              <div :class="[
                'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              ]">
                <div class="flex items-start space-x-2">
                  <div v-if="message.sender === 'assistant'" class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mt-0.5">
                    <Bot class="w-3 h-3 text-white" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm">{{ message.text }}</p>
                    <p class="text-xs opacity-75 mt-1">{{ formatTime(message.timestamp) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isProcessing" class="flex justify-start">
              <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot class="w-3 h-3 text-white" />
                  </div>
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="p-4 border-t bg-gray-50">
            <div class="flex items-center space-x-3">
              <!-- Voice Input Button -->
              <Button
                :class="[
                  'w-12 h-12 rounded-full transition-all duration-200',
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                ]"
                @click="toggleRecording"
                :disabled="!isVoiceSupported"
              >
                <Mic v-if="!isRecording" class="w-5 h-5" />
                <Square v-else class="w-5 h-5" />
              </Button>

              <!-- Text Input -->
              <div class="flex-1">
                <input
                  v-model="textInput"
                  type="text"
                  placeholder="Type your message or use the microphone..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @keydown.enter="sendTextMessage"
                  :disabled="isProcessing"
                />
              </div>

              <!-- Send Button -->
              <Button
                @click="sendTextMessage"
                :disabled="!textInput.trim() || isProcessing"
                class="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send class="w-4 h-4" />
              </Button>
            </div>

            <!-- Voice Support Warning -->
            <div v-if="!isVoiceSupported" class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <AlertCircle class="w-4 h-4 inline mr-1" />
              Voice input is not supported in this browser. Please use text input instead.
            </div>

            <!-- Recording Indicator -->
            <div v-if="isRecording" class="mt-2 flex items-center justify-center text-sm text-red-600">
              <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
              Listening... Speak now or click the microphone to stop
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions Panel -->
      <Card>
        <CardContent class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              v-if="auth.user?.role === 'staff'"
              variant="outline"
              class="justify-start h-auto p-4 text-left"
              @click="quickAction('show patients')"
            >
              <Users class="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div class="font-medium">Show My Patients</div>
                <div class="text-sm text-gray-600">View assigned patients</div>
              </div>
            </Button>

            <Button
              variant="outline"
              class="justify-start h-auto p-4 text-left"
              @click="quickAction('submit feedback')"
            >
              <MessageSquare class="w-5 h-5 mr-3 text-green-600" />
              <div>
                <div class="font-medium">Submit Feedback</div>
                <div class="text-sm text-gray-600">Quick feedback submission</div>
              </div>
            </Button>

            <Button
              v-if="auth.user?.role === 'staff'"
              variant="outline"
              class="justify-start h-auto p-4 text-left"
              @click="quickAction('schedule treatment')"
            >
              <Calendar class="w-5 h-5 mr-3 text-purple-600" />
              <div>
                <div class="font-medium">Schedule Treatment</div>
                <div class="text-sm text-gray-600">Plan patient care</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </UserDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useAuthStore } from '@/stores/auth'
import UserDashboardLayout from '../../components/UserDashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  Mic, Bot, Send, Square, Users, MessageSquare, Calendar,
  AlertCircle
} from 'lucide-vue-next'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

// Speech Recognition types for TypeScript
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
  readonly resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new (): SpeechRecognition
    }
  }
}

// State
const toast = useToast()
const auth = useAuthStore()
const chatContainer = ref<HTMLElement>()

// Voice and chat state
const isRecording = ref(false)
const isProcessing = ref(false)
const textInput = ref('')
const messages = ref<Message[]>([])
const recognition = ref<SpeechRecognition | null>(null)

// Computed
const isVoiceSupported = computed(() => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
})

const connectionStatus = computed(() => {
  if (isProcessing.value) return 'Processing...'
  if (isRecording.value) return 'Listening...'
  return 'Ready to assist'
})

// Helper functions
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const addMessage = (text: string, sender: 'user' | 'assistant') => {
  messages.value.push({
    id: Date.now().toString(),
    text,
    sender,
    timestamp: new Date()
  })
  scrollToBottom()
}

// AI Response simulation
const generateAIResponse = async (userMessage: string): Promise<string> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  const userRole = auth.user?.role
  const message = userMessage.toLowerCase()

  // Role-specific responses
  if (userRole === 'staff') {
    if (message.includes('patient') || message.includes('update record')) {
      return "I can help you update patient records. Please specify the patient's name and what information you'd like to update. For example: 'Update blood pressure for John Doe to 120/80' or 'Add medication allergy for Jane Smith - penicillin'."
    }

    if (message.includes('schedule') || message.includes('treatment')) {
      return "I can assist with treatment scheduling. Please provide the patient's name, treatment type, and preferred date/time. For example: 'Schedule physical therapy for John Doe on Friday at 2 PM' or 'Book surgery consultation for Jane Smith next Tuesday'."
    }

    if (message.includes('feedback')) {
      return "I can help you submit feedback. Please specify who the feedback is about and the details. For example: 'Submit feedback about nurse Sarah - excellent patient care' or 'Feedback for Dr. Johnson - needs improvement in communication'."
    }

    if (message.includes('show') && (message.includes('patient') || message.includes('assigned'))) {
      return "Here are your currently assigned patients: Alice Johnson (Cardiology), Bob Smith (Neurology), and Carol Davis (Oncology). Would you like detailed information about any specific patient?"
    }
  } else {
    // Patient responses
    if (message.includes('feedback') || message.includes('staff') || message.includes('nurse') || message.includes('doctor')) {
      return "I can help you submit feedback about your healthcare team. Please tell me about your experience. For example: 'My nurse was very caring and helpful' or 'The doctor explained everything clearly'. What would you like to share?"
    }

    if (message.includes('appointment') || message.includes('schedule')) {
      return "For appointment scheduling, I can help you request an appointment. However, the actual booking needs to be confirmed by your healthcare provider. What type of appointment are you looking for?"
    }
  }

  // General responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `Hello! I'm your AI healthcare assistant. I'm here to help ${userRole === 'staff' ? 'you manage patients, update records, schedule treatments, and submit feedback' : 'you submit feedback about your healthcare experience'}. What can I assist you with today?`
  }

  if (message.includes('help')) {
    const helpText = userRole === 'staff'
      ? "I can help you with:\n• Updating patient records\n• Scheduling treatments\n• Submitting feedback about patients or colleagues\n• Viewing your assigned patients\n\nJust tell me what you'd like to do!"
      : "I can help you with:\n• Submitting feedback about your healthcare team\n• Answering questions about your care\n• Requesting appointment information\n\nWhat would you like assistance with?"

    return helpText
  }

  return "I understand you'd like assistance. Could you please be more specific about what you need help with? You can ask me about patient records, scheduling, feedback submission, or any other healthcare-related tasks."
}

// Voice recognition setup
const setupSpeechRecognition = () => {
  if (!isVoiceSupported.value) return

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition.value = new SpeechRecognition()

  if (recognition.value) {
    recognition.value.continuous = true
    recognition.value.interimResults = true
    recognition.value.lang = 'en-US'

    recognition.value.onstart = () => {
      isRecording.value = true
    }

    recognition.value.onend = () => {
      isRecording.value = false
    }

    recognition.value.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }

      if (finalTranscript.trim()) {
        textInput.value = finalTranscript.trim()
        sendTextMessage()
      }
    }

    recognition.value.onerror = (event: SpeechRecognitionErrorEvent) => {
      toast.error(`Speech recognition error: ${event.error}`)
      isRecording.value = false
    }
  }
}

// Actions
const toggleRecording = () => {
  if (!recognition.value) return

  if (isRecording.value) {
    recognition.value.stop()
  } else {
    recognition.value.start()
  }
}

const sendTextMessage = async () => {
  const message = textInput.value.trim()
  if (!message || isProcessing.value) return

  // Add user message
  addMessage(message, 'user')
  textInput.value = ''

  // Show processing state
  isProcessing.value = true

  try {
    // Get AI response
    const response = await generateAIResponse(message)
    addMessage(response, 'assistant')
  } catch (error) {
    toast.error('Failed to get AI response')
    addMessage('I apologize, but I encountered an error processing your request. Please try again.', 'assistant')
  } finally {
    isProcessing.value = false
  }
}

const quickAction = (action: string) => {
  textInput.value = action
  sendTextMessage()
}

// Lifecycle
onMounted(() => {
  setupSpeechRecognition()
})
</script>

<style scoped>
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
