import axios from 'axios'

interface DIDTalkRequest {
  source_url: string
  script: {
    type: 'text' | 'audio'
    input: string
    provider?: {
      type: 'microsoft' | 'elevenlabs' | 'amazon'
      voice_id: string
    }
  }
  config?: {
    fluent?: boolean
    pad_audio?: number
    stitch?: boolean
    driver_expressions?: {
      expressions: Array<{
        start_frame: number
        expression: string
        intensity: number
      }>
    }
  }
}

interface DIDTalkResponse {
  id: string
  status: 'created' | 'processing' | 'done' | 'error'
  result_url?: string
  error?: {
    kind: string
    description: string
  }
  created_at?: string
  started_at?: string
  completed_at?: string
}

export class DIDService {
  private apiKey: string
  private baseURL: string = 'https://api.d-id.com'

  constructor() {
    // You'll need to add your D-ID API key to your environment variables
    this.apiKey = import.meta.env.VITE_DID_API_KEY || ''

    if (!this.apiKey) {
      console.warn('⚠️ D-ID API key not found. Please add VITE_DID_API_KEY to your environment variables.')
    }
  }

  /**
   * Create a talking video from text using D-ID API
   */
  async createTalkingVideoFromText(text: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('D-ID API key not configured')
    }

    try {
      console.log('🎬 Creating D-ID talking video for text:', text.substring(0, 50) + '...')

      const requestData: DIDTalkRequest = {
        source_url: 'https://timglobal.uk/aiimage.jpg',
        script: {
          type: 'text',
          input: text,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-DavisNeural' // Professional male voice to match your backend
          }
        },
        config: {
          fluent: true,
          pad_audio: 0.1,
          stitch: true,
          driver_expressions: {
            expressions: [
              {
                start_frame: 0,
                expression: 'neutral',
                intensity: 0.7
              }
            ]
          }
        }
      }

      // Create the talking video
      const response = await axios.post<DIDTalkResponse>(
        `${this.baseURL}/talks`,
        requestData,
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const talkId = response.data.id
      console.log('🎬 D-ID Talk created with ID:', talkId)

      // Poll for completion
      const videoUrl = await this.pollForCompletion(talkId)
      return videoUrl

    } catch (error: any) {
      console.error('❌ D-ID API Error:', error.response?.data || error.message)
      throw new Error(`Failed to create talking video: ${error.response?.data?.error?.description || error.message}`)
    }
  }

  /**
   * Create a talking video from audio data using D-ID API
   */
  async createTalkingVideoFromAudio(audioBase64: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('D-ID API key not configured')
    }

    try {
      console.log('🎬 Creating D-ID talking video from audio')

      // Convert base64 to data URL format that D-ID expects
      const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`

      const requestData: DIDTalkRequest = {
        source_url: 'https://timglobal.uk/aiimage.jpg',
        script: {
          type: 'audio',
          input: audioDataUrl
        },
        config: {
          fluent: true,
          pad_audio: 0.1,
          stitch: true,
          driver_expressions: {
            expressions: [
              {
                start_frame: 0,
                expression: 'neutral',
                intensity: 0.7
              }
            ]
          }
        }
      }

      const response = await axios.post<DIDTalkResponse>(
        `${this.baseURL}/talks`,
        requestData,
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const talkId = response.data.id
      console.log('🎬 D-ID Talk created with ID:', talkId)

      const videoUrl = await this.pollForCompletion(talkId)
      return videoUrl

    } catch (error: any) {
      console.error('❌ D-ID API Error:', error.response?.data || error.message)
      throw new Error(`Failed to create talking video from audio: ${error.response?.data?.error?.description || error.message}`)
    }
  }

  /**
   * Poll D-ID API for video completion
   */
  private async pollForCompletion(talkId: string, maxAttempts: number = 60): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get<DIDTalkResponse>(
          `${this.baseURL}/talks/${talkId}`,
          {
            headers: {
              'Authorization': `Basic ${this.apiKey}`
            }
          }
        )

        const status = response.data.status
        console.log(`🔄 D-ID Status (${attempt + 1}/${maxAttempts}):`, status)

        if (status === 'done' && response.data.result_url) {
          console.log('✅ D-ID Video ready:', response.data.result_url)
          return response.data.result_url
        }

        if (status === 'error') {
          throw new Error(`D-ID Error: ${response.data.error?.description || 'Unknown error'}`)
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error: any) {
        console.error(`❌ Polling attempt ${attempt + 1} failed:`, error.message)

        if (attempt === maxAttempts - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    throw new Error('D-ID video generation timed out after 2 minutes')
  }

  /**
   * Get the status of a D-ID talk
   */
  async getTalkStatus(talkId: string): Promise<DIDTalkResponse> {
    if (!this.apiKey) {
      throw new Error('D-ID API key not configured')
    }

    try {
      const response = await axios.get<DIDTalkResponse>(
        `${this.baseURL}/talks/${talkId}`,
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`
          }
        }
      )

      return response.data
    } catch (error: any) {
      console.error('❌ D-ID Status Check Error:', error.response?.data || error.message)
      throw new Error(`Failed to get talk status: ${error.response?.data?.error?.description || error.message}`)
    }
  }

  /**
   * Check if D-ID service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

export default new DIDService()
