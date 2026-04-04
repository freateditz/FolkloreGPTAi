#!/bin/bash

echo "🚀 Starting FolkloreGPT Backend Servers"
echo "=========================================="

# Check Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Change to project root
cd "$(dirname "$0")/.."

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv backend/venv
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source backend/venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -q -r backend/requirements.txt

# Start the Python AI Backend on port 8000
echo "🤖 Starting Python AI Backend (Gemini + ElevenLabs) on port 8000..."
cd backend
python3 server_v2.py &
PYTHON_PID=$!
echo $PYTHON_PID > ../.backend.pid

cd ..

# Wait for Python backend to start
sleep 3

# Check if Python backend started successfully
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "❌ Failed to start Python backend"
    exit 1
fi

echo ""
echo "✅ Backend Servers Started!"
echo ""
echo "📍 API Endpoints:"
echo "   • Health Check: http://localhost:8000/api/health"
echo "   • AI Chat:      http://localhost:8000/api/chat"
echo "   • Generate:     http://localhost:8000/api/generate"
echo "   • TTS:          http://localhost:8000/api/tts"
echo ""
echo "🛠️  To update ElevenLabs API key (when credits run out):"
echo "   curl -X POST http://localhost:8000/api/voice/settings \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"api_key\": \"your_new_key\"}'"
echo ""
echo "🛑 To stop: kill $(cat .backend.pid)"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $PYTHON_PID 2>/dev/null; rm -f .backend.pid; exit 0" INT
wait $PYTHON_PID