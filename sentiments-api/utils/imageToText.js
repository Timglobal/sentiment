import { OpenAI } from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Analyze image content and extract meaningful text/description using OpenAI Vision API
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string|null>} - Extracted text or description from the image
 */
export async function analyzeImageText(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error('Image file not found:', imagePath)
      return null
    }

    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    const fileExtension = path.extname(imagePath).toLowerCase()
    
    // Determine MIME type
    let mimeType = 'image/jpeg'
    if (fileExtension === '.png') mimeType = 'image/png'
    else if (fileExtension === '.gif') mimeType = 'image/gif'
    else if (fileExtension === '.webp') mimeType = 'image/webp'

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and describe what you see in detail. Focus on:
              - People and their expressions/emotions
              - Activities happening
              - Overall mood and atmosphere
              - Any text visible in the image
              - Context clues about the situation
              
              Provide a descriptive paragraph that captures the essence and emotional content of the image.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })

    const description = response.choices[0]?.message?.content
    
    if (description) {
      console.log(`🖼️ Image analysis completed: ${description.substring(0, 100)}...`)
      return description
    } else {
      console.log('⚠️ No description generated from image')
      return null
    }

  } catch (error) {
    console.error('❌ Image analysis failed:', error.message)
    
    // Fallback: try to extract any visible text using a simpler approach
    try {
      const fallbackResponse = await openai.chat.completions.create({
        model: "gpt-4-vision-preview", 
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this image in one sentence, focusing on the main subject and overall mood."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: "low"
                }
              }
            ]
          }
        ],
        max_tokens: 100
      })
      
      return fallbackResponse.choices[0]?.message?.content || null
    } catch (fallbackError) {
      console.error('❌ Fallback image analysis also failed:', fallbackError.message)
      return null
    }
  }
}

/**
 * Extract any visible text from image using OCR-focused prompt
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string|null>} - Extracted text from the image
 */
export async function extractImageText(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.error('Image file not found:', imagePath)
      return null
    }

    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    const fileExtension = path.extname(imagePath).toLowerCase()
    
    let mimeType = 'image/jpeg'
    if (fileExtension === '.png') mimeType = 'image/png'
    else if (fileExtension === '.gif') mimeType = 'image/gif'
    else if (fileExtension === '.webp') mimeType = 'image/webp'

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text", 
              text: "Extract and transcribe any text visible in this image. If there's no readable text, return 'No text found'."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 200
    })

    const extractedText = response.choices[0]?.message?.content
    
    if (extractedText && extractedText !== 'No text found') {
      console.log(`📝 Extracted text from image: ${extractedText}`)
      return extractedText
    } else {
      return null
    }

  } catch (error) {
    console.error('❌ Text extraction from image failed:', error.message)
    return null
  }
}
