import requests
import os
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Configuration - Easy to swap when credits run out
ELEVENLABS_CONFIG = {
    "api_key": os.environ.get("ELEVENLABS_API_KEY", "sk_3df46ac44697848e74a34dd6c3215d1d00fda4b60059f20f"),
    "voice_id": os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM"),  # Rachel - good for storytelling
    "base_url": "https://api.elevenlabs.io/v1",
    "model_id": "eleven_monolingual_v1"
}

# Alternative voices for storytelling
STORYTELLING_VOICES = {
    "rachel": "21m00Tcm4TlvDq8ikWAM",  # Female, warm, great for stories
    "adam": "pNInz6obpgDQGcFmaJgB",    # Male, deep, authoritative
    "bella": "XB0fDUnXU5powFXDhCwa",   # Female, soft, gentle
    "elli": "MF3mGyEYCl7XYWbV9V6O",    # Female, young, energetic
    "josh": "TxGEqnHWrfWFTfGW9XjX",    # Male, young, friendly
}


class ElevenLabsService:
    """Service for text-to-speech using ElevenLabs API.

    This service is designed to be adaptive - you can easily swap API keys
    by updating the ELEVENLABS_CONFIG dictionary or setting environment variables.

    To swap API key when credits run out:
    1. Set new key: export ELEVENLABS_API_KEY="your_new_key"
    2. Or update the default in ELEVENLABS_CONFIG above
    3. Restart the server
    """

    def __init__(self):
        self.config = ELEVENLABS_CONFIG
        self.headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.config["api_key"]
        }

    def update_api_key(self, new_api_key: str) -> bool:
        """Update the API key at runtime."""
        try:
            self.config["api_key"] = new_api_key
            self.headers["xi-api-key"] = new_api_key
            logger.info("ElevenLabs API key updated successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to update ElevenLabs API key: {e}")
            return False

    def update_voice(self, voice_id: str) -> bool:
        """Change the voice at runtime."""
        if voice_id in STORYTELLING_VOICES:
            self.config["voice_id"] = STORYTELLING_VOICES[voice_id]
        else:
            self.config["voice_id"] = voice_id
        logger.info(f"Voice updated to: {self.config['voice_id']}")
        return True

    def get_available_voices(self) -> Dict[str, str]:
        """Get list of recommended storytelling voices."""
        try:
            url = f"{self.config['base_url']}/voices"
            headers = {"xi-api-key": self.config["api_key"]}

            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                voices = response.json().get("voices", [])
                return {
                    "recommended": STORYTELLING_VOICES,
                    "all_available": [{"id": v["voice_id"], "name": v["name"]} for v in voices[:10]]
                }
            return {"recommended": STORYTELLING_VOICES, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            logger.error(f"Error fetching voices: {e}")
            return {"recommended": STORYTELLING_VOICES, "error": str(e)}

    async def text_to_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
        stability: float = 0.5,
        similarity_boost: float = 0.75,
        style: float = 0.3
    ) -> Dict[str, Any]:
        """Convert text to speech using ElevenLabs API.

        Args:
            text: Text to convert to speech
            voice_id: Voice ID (uses default if not specified)
            stability: Voice stability (0-1)
            similarity_boost: Similarity boost (0-1)
            style: Style exaggeration (0-1)

        Returns:
            Dict with audio_bytes, success status, and error if any
        """
        try:
            voice = voice_id or self.config["voice_id"]
            url = f"{self.config['base_url']}/text-to-speech/{voice}"

            payload = {
                "text": text,
                "model_id": self.config["model_id"],
                "voice_settings": {
                    "stability": stability,
                    "similarity_boost": similarity_boost,
                    "style": style,
                    "use_speaker_boost": True
                }
            }

            response = requests.post(url, json=payload, headers=self.headers)

            if response.status_code == 200:
                return {
                    "audio_bytes": response.content,
                    "content_type": "audio/mpeg",
                    "success": True,
                    "characters_used": len(text)
                }
            elif response.status_code == 401:
                logger.error("ElevenLabs API key is invalid or credits exhausted")
                return {
                    "success": False,
                    "error": "API key invalid or credits exhausted. Please update your API key.",
                    "status_code": 401
                }
            else:
                logger.error(f"ElevenLabs API error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code}",
                    "details": response.text,
                    "status_code": response.status_code
                }

        except Exception as e:
            logger.error(f"Error in text-to-speech: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def stream_text_to_speech(self, text: str, voice_id: Optional[str] = None):
        """Stream text-to-speech for real-time playback."""
        try:
            voice = voice_id or self.config["voice_id"]
            url = f"{self.config['base_url']}/text-to-speech/{voice}/stream"

            payload = {
                "text": text,
                "model_id": self.config["model_id"],
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.3
                }
            }

            response = requests.post(url, json=payload, headers=self.headers, stream=True)

            if response.status_code == 200:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        yield chunk
            else:
                logger.error(f"Streaming error: {response.status_code}")
                yield None

        except Exception as e:
            logger.error(f"Error in stream TTS: {e}")
            yield None

    def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics from ElevenLabs."""
        try:
            url = f"{self.config['base_url']}/user/subscription"
            headers = {"xi-api-key": self.config["api_key"]}

            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "tier": data.get("tier", "unknown"),
                    "character_count": data.get("character_count", 0),
                    "character_limit": data.get("character_limit", 0),
                    "remaining": data.get("character_limit", 0) - data.get("character_count", 0),
                    "next_reset": data.get("next_reset_unix", 0)
                }
            return {
                "success": False,
                "error": f"HTTP {response.status_code}"
            }
        except Exception as e:
            logger.error(f"Error fetching usage stats: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Global instance
elevenlabs_service = ElevenLabsService()
