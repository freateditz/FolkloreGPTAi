from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import random
import io

# Import our services
from services.gemini_service import gemini_service, GeminiService
from services.elevenlabs_service import elevenlabs_service, ElevenLabsService, STORYTELLING_VOICES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection WITH ERROR HANDLING
try:
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[os.environ.get('DB_NAME', 'folklore')]
    print("✅ MongoDB connected successfully")
    mongo_connected = True
except Exception as e:
    print(f"⚠️ MongoDB connection failed: {e}")
    mongo_connected = False
    client = None
    db = None

# Initialize services
gemini = GeminiService()
elevenlabs = ElevenLabsService()

# Create the main app
app = FastAPI(title="FolkloreGPT AI API", version="2.0.0")

# Create a router WITH /api PREFIX
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class StoryRequest(BaseModel):
    prompt: str
    max_length: int = 400
    culture: Optional[str] = None
    tone: Optional[str] = "traditional"

class ChatRequest(BaseModel):
    query: str
    culture: str = "any"
    language: str = "english"
    conversation_history: Optional[List[dict]] = []

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    stability: float = 0.5
    similarity_boost: float = 0.75

class VoiceSettingsRequest(BaseModel):
    api_key: Optional[str] = None
    voice_id: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    culture: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    limit: int = 10

# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@api_router.get("/")
async def root():
    """Root endpoint with system status."""
    return {
        "message": "FolkloreGPT AI API",
        "version": "2.0.0",
        "mongodb": mongo_connected,
        "gemini_ai": True,
        "elevenlabs_tts": True,
        "timestamp": datetime.utcnow().isoformat()
    }

@api_router.get("/health")
async def health():
    """Health check endpoint."""
    services_status = {
        "mongodb": mongo_connected,
        "gemini": True,
        "elevenlabs": True,
        "overall": "healthy" if mongo_connected else "degraded"
    }

    # Check ElevenLabs credits
    try:
        usage = elevenlabs.get_usage_stats()
        services_status["elevenlabs_credits"] = usage.get("remaining", "unknown")
    except:
        services_status["elevenlabs_credits"] = "unknown"

    return {
        "status": services_status["overall"],
        "services": services_status,
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================================================
# AI STORY GENERATION ENDPOINTS
# ============================================================================

@api_router.post("/generate")
async def generate_story(request: StoryRequest):
    """Generate a folklore story using Gemini AI."""
    logger.info(f"📖 Generating story for prompt: '{request.prompt}'")

    result = await gemini.generate_story(
        prompt=request.prompt,
        max_length=request.max_length,
        culture=request.culture,
        tone=request.tone
    )

    if result["success"]:
        return {
            "generated_story": result["generated_story"],
            "title": result.get("title", "Untitled Story"),
            "theme": result["theme"],
            "ai_model": "gemini-2.5-flash",
            "ai_model_used": True,
            "success": True
        }
    else:
        # Fallback to curated stories if AI fails
        fallback_stories = [
            "In the time before clocks, elders measured days by shadow-length and wisdom by listening-depth. They taught that stories are seeds—planted today, flowering when most needed.",
            "The Keeper of Tales once said: 'Every ending whispers a beginning. Every challenge holds a gift wrapped in difficulty. True understanding arrives like dawn—gradually, then all at once.'",
        ]
        return {
            "generated_story": random.choice(fallback_stories),
            "title": "Wisdom Tale",
            "theme": request.prompt,
            "ai_model": "none",
            "ai_model_used": False,
            "fallback": True,
            "error": result.get("error"),
            "success": True
        }

@api_router.post("/chat")
async def chat(request: ChatRequest):
    """Chat with the AI about folklore stories."""
    logger.info(f"💬 Chat query: '{request.query}' (culture: {request.culture})")

    result = await gemini.chat_response(
        query=request.query,
        culture=request.culture,
        language=request.language
    )

    return result

# ============================================================================
# TEXT-TO-SPEECH ENDPOINTS
# ============================================================================

@api_router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using ElevenLabs."""
    logger.info(f"🔊 TTS request: {len(request.text)} characters")

    result = await elevenlabs.text_to_speech(
        text=request.text,
        voice_id=request.voice_id,
        stability=request.stability,
        similarity_boost=request.similarity_boost
    )

    if result["success"]:
        audio_bytes = result["audio_bytes"]
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "X-Characters-Used": str(result["characters_used"]),
                "X-Voice-ID": request.voice_id or elevenlabs.config["voice_id"]
            }
        )
    else:
        # Return error with suggestion to update API key
        return JSONResponse(
            status_code=400 if result.get("status_code") == 401 else 500,
            content={
                "success": False,
                "error": result["error"],
                "suggestion": "Update your ElevenLabs API key using POST /api/voice/settings",
                "voices": list(STORYTELLING_VOICES.keys())
            }
        )

@api_router.get("/tts/stream/{text}")
async def stream_tts(text: str, voice_id: Optional[str] = None):
    """Stream text-to-speech for real-time playback."""
    async def audio_stream():
        async for chunk in elevenlabs.stream_text_to_speech(text, voice_id):
            if chunk:
                yield chunk

    return StreamingResponse(
        audio_stream(),
        media_type="audio/mpeg"
    )

@api_router.get("/voice/voices")
async def get_voices():
    """Get available TTS voices."""
    return {
        "recommended": STORYTELLING_VOICES,
        "current": elevenlabs.config["voice_id"],
        "available": await elevenlabs.get_available_voices()
    }

@api_router.get("/voice/usage")
async def get_voice_usage():
    """Get ElevenLabs usage statistics."""
    return elevenlabs.get_usage_stats()

@api_router.post("/voice/settings")
async def update_voice_settings(request: VoiceSettingsRequest):
    """Update ElevenLabs API key or voice (for easy swapping)."""
    updated = False
    message = []

    if request.api_key:
        success = elevenlabs.update_api_key(request.api_key)
        if success:
            updated = True
            message.append("API key updated")

    if request.voice_id:
        success = elevenlabs.update_voice(request.voice_id)
        if success:
            updated = True
            message.append(f"Voice updated to {request.voice_id}")

    return {
        "success": updated,
        "message": "; ".join(message) if message else "No changes made",
        "current_config": {
            "voice_id": elevenlabs.config["voice_id"],
            "api_key_masked": "***" + elevenlabs.config["api_key"][-4:]
        }
    }

# ============================================================================
# IMAGE ANALYSIS (OCR + Description)
# ============================================================================

@api_router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """Analyze an image using Gemini Vision (OCR + description)."""
    try:
        contents = await file.read()
        logger.info(f"📸 Analyzing image: {file.filename} ({len(contents)} bytes)")

        result = await gemini.analyze_image(contents, file.content_type)

        return result
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# ============================================================================
# STORY SEARCH WITH AI
# ============================================================================

@api_router.post("/search")
async def search_stories(request: SearchRequest):
    """Search stories using AI-enhanced semantic search."""
    if not mongo_connected:
        return {
            "success": False,
            "error": "Database not connected",
            "stories": []
        }

    try:
        # Build query
        query_filter = {"status": "approved"}
        if request.culture:
            query_filter["culture"] = request.culture
        if request.category:
            query_filter["category"] = request.category
        if request.language:
            query_filter["language"] = request.language

        # Text search
        if request.query:
            query_filter["$text"] = {"$search": request.query}

        stories = await db.stories.find(query_filter).limit(request.limit).to_list(length=request.limit)

        # Format stories
        formatted_stories = []
        for story in stories:
            story["id"] = str(story.pop("_id"))
            formatted_stories.append(story)

        return {
            "success": True,
            "stories": formatted_stories,
            "count": len(formatted_stories),
            "query": request.query
        }

    except Exception as e:
        logger.error(f"Error searching stories: {e}")
        return {
            "success": False,
            "error": str(e),
            "stories": []
        }

# ============================================================================
# WEB SPEECH API ENDPOINTS (Proxy for browsers that need it)
# ============================================================================

@api_router.get("/speech/token")
async def get_speech_token():
    """Get a token for Web Speech API (if needed for external services)."""
    # For browser Web Speech API, no token needed - it's built-in
    return {
        "message": "Web Speech API is browser-native, no token required",
        "supported": True,
        "api": "Web Speech API"
    }

# ============================================================================
# SETUP ROUTER
# ============================================================================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()

if __name__ == "__main__":
    import uvicorn
    # Force port 8000 for AI server to avoid conflict with Express on 5000
    ai_port = 8000
    print(f"🤖 AI Server starting on port {ai_port}")
    uvicorn.run(app, host="0.0.0.0", port=ai_port)
