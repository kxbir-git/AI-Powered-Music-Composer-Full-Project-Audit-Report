"""Recommendation engine routes."""

from __future__ import annotations

from bson import ObjectId
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("")
async def get_recommendations(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Get personalized music generation recommendations."""
    user_id = current_user["_id"]

    # Analyze user's generation history
    history = await db.generation_history.find(
        {"userId": user_id}
    ).sort("createdAt", -1).to_list(length=50)

    if not history:
        # Default recommendations for new users
        return {
            "recommendations": [
                {
                    "type": "starter",
                    "title": "🎹 Start with Piano",
                    "description": "Try creating a relaxing piano composition to get started.",
                    "suggestion": {
                        "genre": "ambient",
                        "mood": "relaxed",
                        "instruments": ["piano"],
                        "bpm": 80,
                    },
                },
                {
                    "type": "starter",
                    "title": "🎸 Lo-Fi Beat",
                    "description": "Generate a chill lo-fi beat perfect for studying.",
                    "suggestion": {
                        "genre": "lo-fi",
                        "mood": "peaceful",
                        "instruments": ["piano", "drums", "bass"],
                        "bpm": 75,
                    },
                },
                {
                    "type": "starter",
                    "title": "🎬 Cinematic Score",
                    "description": "Create an epic cinematic orchestral piece.",
                    "suggestion": {
                        "genre": "cinematic",
                        "mood": "inspirational",
                        "instruments": ["strings", "piano", "drums"],
                        "bpm": 100,
                    },
                },
            ],
            "insights": {
                "message": "Welcome! Start creating music and we'll personalize your recommendations.",
            },
        }

    # Analyze patterns in user's history
    genre_counts: dict[str, int] = {}
    mood_counts: dict[str, int] = {}
    instrument_counts: dict[str, int] = {}
    bpm_values: list[int] = []

    for item in history:
        genre = item.get("genre")
        if genre:
            genre_counts[genre] = genre_counts.get(genre, 0) + 1

        mood = item.get("mood")
        if mood:
            mood_counts[mood] = mood_counts.get(mood, 0) + 1

        instruments = item.get("instruments", [])
        for inst in instruments:
            instrument_counts[inst] = instrument_counts.get(inst, 0) + 1

        bpm = item.get("bpm")
        if bpm:
            bpm_values.append(bpm)

    # Find favorites
    top_genre = max(genre_counts, key=genre_counts.get) if genre_counts else "ambient"
    top_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "relaxed"
    top_instruments = sorted(instrument_counts.keys(), key=lambda k: instrument_counts[k], reverse=True)[:3]
    avg_bpm = int(sum(bpm_values) / len(bpm_values)) if bpm_values else 100

    # Generate recommendations
    from app.services.recommendation.engine import RecommendationEngine

    engine = RecommendationEngine()
    recommendations = engine.generate_recommendations(
        top_genre=top_genre,
        top_mood=top_mood,
        top_instruments=top_instruments or ["piano"],
        avg_bpm=avg_bpm,
        genre_counts=genre_counts,
        mood_counts=mood_counts,
    )

    return {
        "recommendations": recommendations,
        "insights": {
            "favoriteGenre": top_genre,
            "favoriteMood": top_mood,
            "favoriteInstruments": top_instruments,
            "averageBpm": avg_bpm,
            "totalCompositions": len(history),
            "message": f"You frequently create {top_genre} music with a {top_mood} mood.",
        },
    }
