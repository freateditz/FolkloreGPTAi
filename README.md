# FolkloreGPT: AI-Powered Indigenous Storyteller

**🎯 Hackathon Theme:** AI/ML (Natural Language Processing, Cultural Preservation)

## 📖 Problem Statement

Indigenous folklore, oral histories, and native languages are disappearing rapidly. Most existing digital archives are static and fail to capture the living, narrative nature of these traditions. They lack interaction, cultural context, and accessibility for younger generations.

## 💡 Solution Overview

*FolkloreGPT* is an AI-powered storytelling platform designed to preserve, generate, and share culturally grounded folklore narratives. The system combines a robust data collection pipeline with a scalable AI architecture to ensure stories remain authentic, contextual, and engaging.

Our approach prioritizes *responsible AI* by building on structured, community-sourced data combined with state-of-the-art Generative AI to weave new tales inspired by ancient traditions.

## 🧱 Tech Stack & System Architecture

The platform follows a **dual-backend architecture** to cleanly separate static data ingestion from heavy AI inference processing.

### 🔹 Frontend (React.js)
- **UI/UX:** Fully custom **Neumorphic Design System** for a premium, accessible, and highly tactile user experience.
- **Styling:** Vanilla CSS mixed with TailwindCSS classes.
- **Features:** Dynamic story prompt interfaces, story continuation mapping, and localized inputs. Runs on **Port 3000**.

### 🔹 Data Backend (Node.js/Express)
- **Database:** MongoDB (with Mongoose)
- **Storage:** Cloudinary (Images) & Local Storage (Audio) via Multer.
- **Responsibilities:** Handles structured structured metadata uploads and serves static assets. Runs on **Port 5000**.

### 🔹 AI Backend (Python/FastAPI)
- **Story Generation Model:** Google's **Gemini 2.5 Flash** integrated natively for highly intelligent, context-aware, and culturally respectful folklore generation.
- **Audio Model:** **ElevenLabs TTS** integration for lifelike spoken word.
- **Responsibilities:** Asynchronous endpoints (`/api/generate`, `/api/chat`, `/api/tts`) serving model inferences seamlessly. Runs on **Port 8000**.

## 🚀 How to Run the Project Locally

We have bundled a seamless master startup script that handles killing stale ports, checking dependencies, and booting all three services sequentially.

### 1. Unified Startup (Recommended)
Simply open your terminal in the root directory and run:
```bash
./start_everything.sh
```
*Alternatively: `bash start_everything.sh`*

This will:
1. Boot the MongoDB Data Server on `http://localhost:5000`
2. Boot the Python AI Server on `http://localhost:8000`
3. Launch the React Frontend on `http://localhost:3000`

Live logs for all servers are automatically written to the `/logs/` folder.

### 2. Manual Startup
If you prefer running services independently:
- **Data Server:** `cd data && npm install && node server.js`
- **AI Server:** `cd backend && source venv/bin/activate && pip install -r requirements.txt && python3 server_v2.py`
- **Frontend:** `cd frontend && npm install && npm start`

## 🔄 Data Flow

1. User submits criteria via the Neumorphic React frontend.
2. The AI Python backend ingests Tone, Length, Culture, and Text Prompts.
3. **Gemini 2.5 Flash** synthesizes an authentic folktale based on guardrails and cultural instructions.
4. The generated story is passed back to the user with options to copy or dynamically extend ("Continue Story").
5. Separately, Community uploads (audio/text) are verified and processed by the Express backend and dumped to MongoDB & Cloudinary to create a historical grounding archive.

## 🧠 AI Model Strategy

### Current Implementation
- **Text Generation:** Google `gemini-2.5-flash` natively integrated. It replaces previous experimental hackathon implementations (like distilgpt2) due to vastly superior contextual awareness and speed.
- **Audio Generation:** ElevenLabs text-to-speech for highly emotional narrative pacing.

### Future Strategy
- Implement **Retrieval-Augmented Generation (RAG)** linking our community MongoDB data strictly to the Gemini embeddings pipeline. This will force the AI to directly sample structural styles from uploaded community stories, eliminating hallucinations.
- Expand local multilingual translation vectors.

## 📈 Scalability & Reliability Plan

### Failure Recovery & Isolation
- The Dual-Backend approach prevents cascading failures. If the Python AI service drops, the database and frontend stay perfectly functional for searching historical community archives.
- Graceful error messaging natively built into the React UI handles API timeouts flawlessly.

## 🛣️ Execution Roadmap

#### **Phase 1 – Data Foundation (Completed) ✅**
- Developed **FolkloreBase**, a robust platform for structured folklore collection.
- Designed MongoDB schema for cultural context and story metadata.
- Stored media in Cloudinary for reliability and scalability.

#### **Phase 2 – AI Integration & Deployment (Completed) ✅**
- Integrated Google's `gemini-2.5-flash` for high-quality folktale generation with Length/Culture/Tone controls.
- Designed complete Neumorphic Frontend design system for a premium aesthetic.
- Maintained dual-backend architecture for stability via FastAPI and Express.
- Developed unified `start_everything.sh` workflow.

#### **Phase 3 – Advanced Intelligence & RAG (Next Steps) 🚀**
- Implementing **Retrieval-Augmented Generation (RAG)** to weave actual community-uploaded MongoDB stories straight into the AI prompt window.
- Activating real-time API streaming of ElevenLabs narrative audio across the frontend.
- Containerizing the system fully with Docker Compose.
