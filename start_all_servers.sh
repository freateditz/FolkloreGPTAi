#!/bin/bash

echo "🚀 Starting FolkloreGPT Full Stack Servers"
echo "==========================================="
echo ""

# Unset PORT to prevent conflicts
unset PORT

# Kill existing processes on ports 5000 and 8000
echo "🧹 Cleaning up existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 1

# Check Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

# Check Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

cd "$(dirname "$0")"

# ============================================
# Start Express Data Server (Port 5000)
# ============================================
echo ""
echo "📦 Setting up Express Data Server..."
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing Node.js dependencies..."
    npm install
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: No .env file found. Using default configuration."
fi

echo "🚀 Starting Express Data Server on port 5000..."
node server.js &
EXPRESS_PID=$!
cd ..

# Wait for Express to start
sleep 2

# Check if Express started
if ! kill -0 $EXPRESS_PID 2>/dev/null; then
    echo "❌ Failed to start Express server"
    exit 1
fi

echo "✅ Express Data Server running on http://localhost:5000"

# ============================================
# Start Python AI Server (Port 8000)
# ============================================
echo ""
echo "🐍 Setting up Python AI Server..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -q -r requirements.txt

echo "🤖 Starting Python AI Server (Gemini + ElevenLabs) on port 8000..."
python3 server_v2.py &
PYTHON_PID=$!
cd ..

# Wait for Python to start
sleep 3

# Check if Python started
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "❌ Failed to start Python AI server"
    kill $EXPRESS_PID 2>/dev/null
    exit 1
fi

echo "✅ Python AI Server running on http://localhost:8000"

# ============================================
# Summary
# ============================================
echo ""
echo "==========================================="
echo "✅ All Servers Started Successfully!"
echo "==========================================="
echo ""
echo "📍 Data Server (Express) - Port 5000:"
echo "   • Health:    http://localhost:5000/api/health"
echo "   • Stories:   http://localhost:5000/api/stories"
echo ""
echo "📍 AI Server (Python) - Port 8000:"
echo "   • Health:    http://localhost:8000/api/health"
echo "   • Generate:  http://localhost:8000/api/generate"
echo "   • Chat:      http://localhost:8000/api/chat"
echo "   • TTS:       http://localhost:8000/api/tts"
echo ""
echo "🛑 To stop all servers: Press Ctrl+C"
echo ""

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping all servers...'; kill $EXPRESS_PID $PYTHON_PID 2>/dev/null; exit 0" INT
wait
