# 🎵 AI-Powered Personal Music Composer

An AI-powered web application that acts as a personal digital music composer. Generate original music using artificial intelligence based on mood, genre, instruments, tempo, and natural-language descriptions.

## 🚀 Features

- **Text-to-Music Generation** — Enter a prompt like *"Create a relaxing piano track for studying"*
- **AI Music Pipeline** — NLP → Music Theory → Melody/Chord/Rhythm Generation → MIDI → Audio
- **Advanced Controls** — Genre, mood, instruments, BPM, key, scale, time signature, duration
- **Music Player** — Professional player with waveform visualization
- **Audio Visualizer** — Real-time frequency bars, spectrum, and waveform
- **Music Library** — Manage, organize, and search your compositions
- **AI Variations** — Create variations of any generated track
- **Audio Analyzer** — Upload and analyze audio files (BPM, key, mood, energy)
- **AI Assistant** — Conversational music editing ("Make the melody more emotional")
- **Personalization** — AI-powered recommendations based on your history
- **Export** — Download as MP3, WAV, or MIDI

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Vite + React   │────▶│  FastAPI Backend  │────▶│   MongoDB    │
│   (TypeScript)  │     │   (Python 3.11+) │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘
                               │
                        ┌──────┴──────┐
                        │ AI Pipeline │
                        │  - NLP      │
                        │  - Music    │
                        │    Theory   │
                        │  - MIDI Gen │
                        │  - Audio    │
                        │    Render   │
                        └─────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **MongoDB** 6.0+ (local or Atlas)
- **FluidSynth** (for audio rendering)

## ⚡ Quick Start

### 1. Clone & Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```

Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Docker (Alternative)

```bash
docker-compose up --build
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite 5, React 18, TypeScript, Tailwind CSS, Lucide Icons |
| State | React Context, Custom Hooks |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database | MongoDB with Motor (async) |
| Auth | JWT (PyJWT), bcrypt |
| AI/ML | music21, PrettyMIDI, librosa, NumPy, SciPy |
| Audio | FluidSynth, SoundFile, pydub |
| Storage | Local / Cloudinary / S3 |

## 📁 Project Structure

```
ai-personal-music-composer/
├── frontend/          # Vite + React application
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── config/    # Settings & configuration
│   │   ├── database/  # MongoDB connection
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic & AI
│   │   ├── ml/        # ML model management
│   │   └── utils/     # Helpers & utilities
│   └── requirements.txt
├── docs/              # Documentation
├── docker/            # Docker configs
└── docker-compose.yml
```

## 📝 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## 🎯 GPU Requirements

The algorithmic composer works **without a GPU**. For advanced AI models (MusicGen, AudioCraft), a CUDA-compatible GPU is recommended but not required.

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
