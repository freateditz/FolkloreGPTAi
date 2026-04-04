#!/bin/bash

echo "🚀 Starting FolkloreGPT — Full Stack (Data + AI + Frontend)"
echo "============================================================"
echo ""

ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$ROOT/logs"

# ─── Kill stale processes ────────────────────────────────────────────────────
echo "🧹 Cleaning up ports 5000, 8000, 3000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# ─── Prerequisites ───────────────────────────────────────────────────────────
command -v node    >/dev/null 2>&1 || { echo "❌ Node.js not found. Please install Node 16+."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 not found. Please install Python 3.8+."; exit 1; }

# ─── 1. Data Server (Node/Express — Port 5000) ───────────────────────────────
echo ""
echo "📦 [1/3] Starting Data Server (port 5000)..."
cd "$ROOT/data"
if [ ! -d node_modules ]; then
  echo "  Installing npm deps..."
  npm install --silent
fi
node server.js > "$ROOT/logs/data.log" 2>&1 &
DATA_PID=$!
echo "  Waiting for Data Server to initialise..."
sleep 5

# Check it's still alive (process running OR port is open)
if kill -0 $DATA_PID 2>/dev/null || lsof -ti:5000 >/dev/null 2>&1; then
  echo "✅ Data Server running  →  http://localhost:5000"
else
  echo "❌ Data server failed to start."
  echo "--- logs/data.log ---"
  tail -20 "$ROOT/logs/data.log"
  exit 1
fi

# ─── 2. AI Server (Python/FastAPI — Port 8000) ───────────────────────────────
echo ""
echo "🤖 [2/3] Starting AI Server (port 8000)..."
cd "$ROOT/backend"
if [ ! -d venv ]; then
  echo "  Creating Python venv..."
  python3 -m venv venv
fi
source venv/bin/activate
echo "  Installing Python dependencies (this may take a moment)..."
pip install -q -r requirements.txt
python3 server_v2.py > "$ROOT/logs/ai.log" 2>&1 &
AI_PID=$!
echo "  Waiting for AI Server to initialise..."
sleep 6

if kill -0 $AI_PID 2>/dev/null || lsof -ti:8000 >/dev/null 2>&1; then
  echo "✅ AI Server running    →  http://localhost:8000"
else
  echo "❌ AI server failed to start."
  echo "--- logs/ai.log ---"
  tail -20 "$ROOT/logs/ai.log"
  kill $DATA_PID 2>/dev/null
  exit 1
fi

# ─── 3. Frontend (React/Craco — Port 3000) ───────────────────────────────────
echo ""
echo "🎨 [3/3] Starting Frontend (port 3000)..."
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  echo "  Installing npm deps (this will take a few minutes)..."
  npm install --silent
fi
BROWSER=none npm start > "$ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "  Waiting for Frontend to compile..."
sleep 15

if kill -0 $FRONTEND_PID 2>/dev/null || lsof -ti:3000 >/dev/null 2>&1; then
  echo "✅ Frontend running     →  http://localhost:3000"
else
  echo "❌ Frontend failed to start."
  echo "--- logs/frontend.log (last 30 lines) ---"
  tail -30 "$ROOT/logs/frontend.log"
  kill $DATA_PID $AI_PID 2>/dev/null
  exit 1
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo "✅ All services are UP!"
echo "============================================================"
echo ""
echo "  🗄  Data Server  (Express)  →  http://localhost:5000"
echo "       Health:   http://localhost:5000/api/health"
echo "       Stories:  http://localhost:5000/api/stories"
echo ""
echo "  🤖  AI Server   (Python)   →  http://localhost:8000"
echo "       Health:   http://localhost:8000/api/health"
echo "       Generate: http://localhost:8000/api/generate"
echo "       Chat:     http://localhost:8000/api/chat"
echo ""
echo "  🌐  Frontend    (React)    →  http://localhost:3000"
echo ""
echo "  📄  Live logs in: $ROOT/logs/"
echo "       tail -f $ROOT/logs/data.log"
echo "       tail -f $ROOT/logs/ai.log"
echo "       tail -f $ROOT/logs/frontend.log"
echo ""
echo "  🛑  Press Ctrl+C to stop all servers."
echo ""

# ─── Graceful shutdown on Ctrl+C ─────────────────────────────────────────────
trap '
  echo ""
  echo "🛑 Stopping all servers (PIDs: $DATA_PID $AI_PID $FRONTEND_PID)..."
  kill $DATA_PID $AI_PID $FRONTEND_PID 2>/dev/null
  lsof -ti:5000 | xargs kill -9 2>/dev/null || true
  lsof -ti:8000 | xargs kill -9 2>/dev/null || true
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  echo "👋 Goodbye!"
  exit 0
' INT

wait
