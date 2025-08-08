#!/bin/bash

echo "🎙️ Starting AI Assistant Voice System Setup"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the sentiments-api directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create temp directory
echo "📁 Creating temporary directory for audio files..."
mkdir -p temp

# Check for required environment variables
echo "🔍 Checking environment variables..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set in environment"
    echo "   You can set it in your .env file"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  Warning: JWT_SECRET not set in environment"
    echo "   You can set it in your .env file"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 To start the AI Assistant system:"
echo "   1. Backend: npm run dev (from sentiments-api directory)"
echo "   2. Frontend: npm run dev (from sentiments-ui directory)"
echo ""
echo "🎙️ WebSocket endpoint will be available at: ws://localhost:5000/ai-voice-stream"
echo "🌐 Frontend will connect automatically when you visit the AI Assistant page"
echo ""
echo "📝 Features included:"
echo "   ✓ Real-time voice streaming with WebSocket"
echo "   ✓ Speech-to-text using OpenAI Whisper"
echo "   ✓ AI processing with GPT-4o"
echo "   ✓ Text-to-speech with OpenAI TTS"
echo "   ✓ Role-based task management"
echo "   ✓ Patient information retrieval"
echo "   ✓ Feedback collection"
echo "   ✓ Conversation logging"
echo ""
