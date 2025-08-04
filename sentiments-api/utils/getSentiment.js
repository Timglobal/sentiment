import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure to set your API key in .env
});

/**
 * Analyze sentiment of a given text and return a score from 1 (worst) to 100 (best).
 * @param {string} text - The text to analyze (e.g., video transcript).
 * @returns {Promise<number>} - A number between 1 and 100 indicating sentiment.
 */
export async function getSentimentScore(text) {
  const prompt = `
You are a sentiment analysis expert.

Rate the overall sentiment of the following text on a scale of 1 to 100:
- 1 is extremely negative (e.g., hate, fear, rage)
- 50 is neutral or uncertain
- 100 is extremely positive (e.g., joy, excitement, peace)

Only return a number (no explanation).

Text:
"""
${text}
"""

Sentiment score:
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo" if you prefer
      messages: [
        { role: "system", content: "You are a sentiment scoring assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const rawOutput = completion.choices[0].message.content.trim();
    const score = parseInt(rawOutput, 10);

    if (isNaN(score)) {
      throw new Error(`Invalid score returned: ${rawOutput}`);
    }

    return Math.max(1, Math.min(100, score)); // Clamp to 1–100
  } catch (error) {
    console.error("Error getting sentiment score:", error.message);
    return -1; // Use -1 to indicate failure
  }
}
