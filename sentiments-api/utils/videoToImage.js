import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { analyzeImageText } from './imageToText.js'

/**
 * Extract frames from video and analyze them for content when no audio is available
 * @param {string} videoPath - Path to the video file
 * @returns {Promise<string|null>} - Extracted content from video frames
 */
export async function analyzeVideoFrames(videoPath) {
  try {
    console.log(`🎬 Analyzing video frames for: ${videoPath}`)
    
    if (!fs.existsSync(videoPath)) {
      console.error('Video file not found:', videoPath)
      return null
    }

    // Create temporary directory for frames
    const tempDir = path.join(path.dirname(videoPath), 'temp_frames')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Extract frames using ffmpeg (extract 3 frames at different timestamps)
    const framePromises = []
    const timestamps = ['00:00:01', '00:00:03', '00:00:05'] // Extract frames at 1s, 3s, 5s

    // First, get video duration to adjust timestamps if video is shorter
    const durationPromise = new Promise((resolve) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        videoPath
      ])

      let output = ''
      ffprobe.stdout.on('data', (data) => {
        output += data.toString()
      })

      ffprobe.on('close', () => {
        const duration = parseFloat(output.trim()) || 10 // Default to 10 seconds if can't determine
        resolve(Math.max(5, duration)) // Ensure at least 5 seconds
      })

      ffprobe.on('error', () => {
        resolve(10) // Default duration
      })
    })

    const videoDuration = await durationPromise
    
    // Adjust timestamps based on video duration
    const adjustedTimestamps = videoDuration < 5 
      ? ['00:00:00.5'] // Very short video, just take one frame
      : videoDuration < 10
      ? ['00:00:01', '00:00:03'] // Short video, take 2 frames
      : timestamps // Normal length, take 3 frames

    for (let i = 0; i < adjustedTimestamps.length; i++) {
      const timestamp = adjustedTimestamps[i]
      const framePath = path.join(tempDir, `frame_${i + 1}.jpg`)
      
      const extractFrame = new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', videoPath,
          '-ss', timestamp,
          '-vframes', '1',
          '-q:v', '2',
          '-y', // Overwrite output file
          framePath
        ])

        ffmpeg.on('close', (code) => {
          if (code === 0 && fs.existsSync(framePath)) {
            resolve(framePath)
          } else {
            console.warn(`⚠️ Failed to extract frame at ${timestamp}`)
            resolve(null)
          }
        })

        ffmpeg.on('error', (err) => {
          console.warn(`⚠️ FFmpeg error for frame at ${timestamp}:`, err.message)
          resolve(null)
        })

        // Set timeout to prevent hanging
        setTimeout(() => {
          ffmpeg.kill()
          reject(new Error(`Frame extraction timeout for ${timestamp}`))
        }, 10000)
      })

      framePromises.push(extractFrame)
    }

    // Wait for all frame extractions to complete
    const extractedFrames = await Promise.allSettled(framePromises)
    const validFrames = extractedFrames
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)

    if (validFrames.length === 0) {
      console.log('⚠️ No frames could be extracted from video')
      await cleanupTempDir(tempDir)
      return null
    }

    console.log(`📸 Extracted ${validFrames.length} frames for analysis`)

    // Analyze each frame and combine results
    const frameAnalyses = []
    for (const framePath of validFrames) {
      try {
        const analysis = await analyzeImageText(framePath)
        if (analysis && analysis.trim().length > 0) {
          frameAnalyses.push(analysis)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to analyze frame: ${framePath}`, error.message)
      }
    }

    // Clean up temporary files
    await cleanupTempDir(tempDir)

    if (frameAnalyses.length === 0) {
      console.log('⚠️ No meaningful content found in video frames')
      return null
    }

    // Combine frame analyses into a comprehensive description
    const combinedAnalysis = `Video content analysis from ${frameAnalyses.length} frames: ${frameAnalyses.join(' | ')}`
    
    console.log(`🎬 Video frame analysis completed: ${combinedAnalysis.substring(0, 100)}...`)
    return combinedAnalysis

  } catch (error) {
    console.error('❌ Video frame analysis failed:', error.message)
    return null
  }
}

/**
 * Clean up temporary directory and files
 * @param {string} tempDir - Path to temporary directory
 */
async function cleanupTempDir(tempDir) {
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir)
      for (const file of files) {
        const filePath = path.join(tempDir, file)
        fs.unlinkSync(filePath)
      }
      fs.rmdirSync(tempDir)
      console.log(`🧹 Cleaned up temporary frames directory`)
    }
  } catch (error) {
    console.warn('⚠️ Failed to cleanup temp directory:', error.message)
  }
}

/**
 * Check if ffmpeg is available on the system
 * @returns {Promise<boolean>} - Whether ffmpeg is available
 */
export async function checkFFmpegAvailable() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version'])
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0)
    })
    
    ffmpeg.on('error', () => {
      resolve(false)
    })
    
    // Timeout after 5 seconds
    setTimeout(() => {
      ffmpeg.kill()
      resolve(false)
    }, 5000)
  })
}
