# FolkloreGPT Setup Guide

## 🎯 What's Been Implemented

### ✅ AI Integration (Gemini API)
- **Story Generation**: AI generates folklore stories from prompts
- **Chat Assistant**: Conversational AI that answers folklore questions
- **Image Analysis**: OCR and image description using Gemini Vision
- **Free tier**: 1,500 requests/day

### ✅ Text-to-Speech (ElevenLabs + Browser Fallback)
- **ElevenLabs**: High-quality AI voices (10,000 chars/month free)
- **Adaptive Config**: Easy API key swapping when credits run out
- **Browser Fallback**: Web Speech API when ElevenLabs is unavailable

### ✅ Speech-to-Text (Web Speech API)
- **Browser-native**: No API keys needed
- **Multi-language**: Supports 40+ languages
- **Real-time**: Live transcription as you speak

### ✅ OCR (Tesseract.js)
- **Browser-based**: Extract text from uploaded images
- **Multiple languages**: Support for major world languages
- **Auto-fill**: Automatically populate story text from images

### ✅ Backend Features
- **MongoDB**: Story storage with search
- **File Uploads**: Audio and image storage via Cloudinary
- **REST API**: Full CRUD operations

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend (Python)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend (Node.js)
cd frontend
yarn install
```

### 2. Start the Servers

```bash
# Backend (Terminal 1)
cd backend
python3 server_v2.py

# OR use the startup script:
chmod +x start_backend.sh
./start_backend.sh

# Frontend (Terminal 2)
cd frontend
yarn start
```

### 3. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Health Check: http://localhost:8000/api/health

---

## 🔧 Configuration

### Swapping ElevenLabs API Key (when credits run out)

**Option 1: Environment Variable**
```bash
export ELEVENLABS_API_KEY="your_new_key"
```

**Option 2: API Call**
```bash
curl -X POST http://localhost:8000/api/voice/settings \
  -H 'Content-Type: application/json' \
  -d '{"api_key": "your_new_key", "voice_id": "21m00Tcm4TlvDq8ikWAM"}'
```

**Option 3: Edit Config File**
Edit `backend/services/elevenlabs_service.py` and update the default key.

---

## 📁 Project Structure

```
folkloreGPT-main/
├── backend/
│   ├── server_v2.py          # Main FastAPI server
│   ├── services/
│   │   ├── gemini_service.py     # Google Gemini AI
│   │   └── elevenlabs_service.py # TTS with adaptive config
│   └── requirements.txt
├── data/
│   └── server.js            # Node.js upload server (port 5000)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Listen.jsx   # Voice assistant (Web Speech API)
│   │   │   ├── Submit.jsx   # Story upload with OCR
│   │   │   └── StoryDetail.jsx # Story reading with TTS
│   │   ├── hooks/
│   │   │   └── useSpeech.js # Web Speech API hooks
│   │   └── services/
│   │       └── ocrService.js # Tesseract.js OCR
│   └── package.json
├── start_backend.sh         # Backend startup script
└── README.md
```

---

## 🎤 Using Voice Features

### Voice Assistant (/listen)
1. Click the microphone button
2. Speak your question (e.g., "Tell me a story about the moon")
3. The AI will respond with a story and read it aloud

### Upload with OCR (/submit)
1. Go to Submit page
2. Select "Mixed Media" tab
3. Upload an image containing text
4. Click "OCR" button on the image
5. The extracted text will auto-fill the story

---

## 🔑 API Keys

| Service | Key | Status |
|---------|-----|--------|
| Gemini | `AIzaSyBeG_qYexvLU6xj5xVREQvME-0V1TcaAuI` | ✅ Free tier (1,500/day) |
| ElevenLabs | `sk_3df46ac44697848e74a34dd6c3215d1d00fda4b60059f20f` | ✅ Free tier (10k chars/month) |
| MongoDB | In `.env` files | ✅ Atlas Free tier |

---

## 🐛 Troubleshooting

### "Speech recognition not supported"
- **Solution**: Use Chrome, Edge, or Safari (WebKit browsers)

### "ElevenLabs credits exhausted"
- **Solution**: 
  1. Create new ElevenLabs account
  2. Get new API key
  3. Update via API: `POST /api/voice/settings`

### "OCR not working"
- **Solution**: Ensure image is clear, text is readable
- Supported formats: JPG, PNG, WebP, BMP

### "MongoDB connection failed"
- **Solution**: Check network connection, verify MongoDB Atlas IP whitelist

---

## 📝 Next Steps

- [ ] Fine-tune Gemini prompts for better stories
- [ ] Add more storytelling voices to ElevenLabs
- [ ] Implement story rating system
- [ ] Add multi-language story translation
- [ ] Create admin dashboard for story moderation

---

**Built with ❤️ using:**
- React + Tailwind CSS
- FastAPI + Python
- Google Gemini AI
- ElevenLabs TTS
- MongoDB Atlas
- Cloudinary
