import fs from "fs";
import axios from "axios";
import FormData from "form-data";

/**
 * Transcribe an audio/video file to text using OpenAI Whisper API.
 * @param {string} filePath - Path to the audio/video file (e.g., .mp3, .mp4).
 * @returns {Promise<string>} - Transcribed text from the file.
 */
export async function getTranscript(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  formData.append("model", "whisper-1");
  formData.append("response_format", "text");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    const transcript = response.data;
    
    // Check if transcript is meaningful (not just silence or noise)
    if (!transcript || transcript.trim().length === 0 || 
        transcript.toLowerCase().includes('no speech') ||
        transcript.toLowerCase().includes('silence') ||
        transcript.trim() === '.') {
      console.log('⚠️ No meaningful audio content found in video');
      return null;
    }

    return transcript; // plain text
  } catch (error) {
    console.error("Transcription failed:", error.response?.data || error.message);
    
    // Check if error is due to no audio content
    if (error.response?.data?.error?.message?.includes('audio') ||
        error.response?.status === 400) {
      console.log('⚠️ Video may not contain audio content');
    }
    
    return null;
  }
}
