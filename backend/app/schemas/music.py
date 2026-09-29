"""Music generation and project schemas."""

from __future__ import annotations

from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class Genre(str, Enum):
    CLASSICAL = "classical"
    LOFI = "lo-fi"
    POP = "pop"
    ROCK = "rock"
    JAZZ = "jazz"
    ELECTRONIC = "electronic"
    HIPHOP = "hip-hop"
    CINEMATIC = "cinematic"
    AMBIENT = "ambient"
    FOLK = "folk"


class Mood(str, Enum):
    HAPPY = "happy"
    SAD = "sad"
    RELAXED = "relaxed"
    ENERGETIC = "energetic"
    ROMANTIC = "romantic"
    DARK = "dark"
    PEACEFUL = "peaceful"
    INSPIRATIONAL = "inspirational"
    MYSTERIOUS = "mysterious"


class Instrument(str, Enum):
    PIANO = "piano"
    GUITAR = "guitar"
    VIOLIN = "violin"
    CELLO = "cello"
    FLUTE = "flute"
    SYNTH = "synth"
    BASS = "bass"
    DRUMS = "drums"
    STRINGS = "strings"
    PERCUSSION = "percussion"


class MusicalKey(str, Enum):
    C = "C"
    C_SHARP = "C#"
    D = "D"
    D_SHARP = "D#"
    E = "E"
    F = "F"
    F_SHARP = "F#"
    G = "G"
    G_SHARP = "G#"
    A = "A"
    A_SHARP = "A#"
    B = "B"


class Scale(str, Enum):
    MAJOR = "major"
    MINOR = "minor"
    DORIAN = "dorian"
    MIXOLYDIAN = "mixolydian"
    PENTATONIC = "pentatonic"
    PENTATONIC_MAJOR = "pentatonic_major"
    PENTATONIC_MINOR = "pentatonic_minor"
    BLUES = "blues"
    HARMONIC_MINOR = "harmonic_minor"


class TimeSignature(str, Enum):
    FOUR_FOUR = "4/4"
    THREE_FOUR = "3/4"
    SIX_EIGHT = "6/8"
    TWO_FOUR = "2/4"


class GenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class GenerateMusicRequest(BaseModel):
    """Request to generate music."""

    prompt: Optional[str] = Field(None, max_length=500, description="Natural language music prompt")
    genre: Optional[Genre] = None
    mood: Optional[Mood] = None
    instruments: List[Instrument] = Field(default_factory=list)
    bpm: Optional[int] = Field(None, ge=40, le=240)
    key: Optional[MusicalKey] = None
    scale: Optional[Scale] = None
    timeSignature: Optional[TimeSignature] = Field(default=TimeSignature.FOUR_FOUR)
    duration: Optional[int] = Field(None, ge=10, le=300, description="Duration in seconds")
    title: Optional[str] = Field(None, max_length=200)
    advancedMode: bool = False


class GenerationResponse(BaseModel):
    """Response for a generation request."""

    id: str
    projectId: str
    status: GenerationStatus
    message: str = ""


class GenerateVariationRequest(BaseModel):
    """Request to create a variation of an existing track."""

    projectId: str
    variationType: str = Field(
        ...,
        description="Type: more_energetic, more_relaxing, faster, slower, different_instruments, different_genre, different_mood, different_melody",
    )
    parameters: dict = Field(default_factory=dict)


class ProjectResponse(BaseModel):
    """Project/track response."""

    id: str = Field(..., alias="_id")
    userId: str
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    mood: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    scale: Optional[str] = None
    duration: Optional[float] = None
    instruments: List[str] = []
    prompt: Optional[str] = None
    audioUrl: Optional[str] = None
    midiUrl: Optional[str] = None
    coverImage: Optional[str] = None
    status: str = "completed"
    generationTime: Optional[float] = None
    structure: Optional[dict] = None
    createdAt: str
    updatedAt: str

    class Config:
        populate_by_name = True


class UpdateProjectRequest(BaseModel):
    """Update project metadata."""

    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    coverImage: Optional[str] = None


class MusicAnalysisRequest(BaseModel):
    """Request for audio analysis (metadata only, file sent separately)."""

    pass


class MusicAnalysisResponse(BaseModel):
    """Audio analysis result."""

    bpm: Optional[float] = None
    key: Optional[str] = None
    scale: Optional[str] = None
    energy: Optional[float] = None
    mood: Optional[str] = None
    duration: Optional[float] = None
    estimatedGenre: Optional[str] = None
    spectralCentroid: Optional[float] = None
    spectralRolloff: Optional[float] = None
    zeroCrossingRate: Optional[float] = None
    rms: Optional[float] = None


class AssistantMessage(BaseModel):
    """AI assistant chat message."""

    message: str = Field(..., max_length=500)
    projectId: Optional[str] = None
    context: dict = Field(default_factory=dict)


class AssistantResponse(BaseModel):
    """AI assistant response."""

    reply: str
    actions: List[dict] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
