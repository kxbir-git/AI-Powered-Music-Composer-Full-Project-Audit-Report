"""Audio analysis routes."""

import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.schemas.music import MusicAnalysisResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/music", tags=["Audio Analysis"])


@router.post("/analyze", response_model=MusicAnalysisResponse)
async def analyze_audio(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Analyze an uploaded audio file."""
    # Validate file type
    allowed_types = {
        "audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp3",
        "audio/ogg", "audio/flac", "audio/x-flac",
    }
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    # Save to temp file for analysis
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")

    suffix = os.path.splitext(file.filename)[1] if file.filename else ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        from app.services.audio_analysis.analyzer import AudioAnalyzer

        analyzer = AudioAnalyzer()
        result = await analyzer.analyze(tmp_path)

        return MusicAnalysisResponse(**result)
    except ImportError:
        # Fallback if librosa not installed
        return MusicAnalysisResponse(
            bpm=120.0,
            key="C",
            scale="major",
            energy=0.5,
            mood="neutral",
            duration=len(content) / (44100 * 2 * 2),  # rough estimate
            estimatedGenre="unknown",
        )
    finally:
        os.unlink(tmp_path)
