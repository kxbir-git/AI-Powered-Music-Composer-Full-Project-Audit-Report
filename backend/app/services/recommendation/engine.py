"""Recommendation engine service."""

from __future__ import annotations


class RecommendationEngine:
    """Generates personalized music recommendations based on user history and music theory rules."""

    def generate_recommendations(
        self,
        top_genre: str,
        top_mood: str,
        top_instruments: list[str],
        avg_bpm: int,
        genre_counts: dict[str, int],
        mood_counts: dict[str, int],
    ) -> list[dict]:
        """Generate personalized suggestions for next compositions."""
        recommendations = []

        # 1. Favorite Style Continuation
        recommendations.append({
            "type": "personalized",
            "title": f"✨ Your Signature Style ({top_genre.capitalize()} + {top_mood.capitalize()})",
            "description": f"Generate a track aligned with your most used style: {top_genre} in a {top_mood} mood.",
            "suggestion": {
                "genre": top_genre,
                "mood": top_mood,
                "instruments": top_instruments,
                "bpm": avg_bpm,
            },
        })

        # 2. Complementary Style Discovery
        complementary_map = {
            "ambient": {"genre": "cinematic", "mood": "peaceful", "bpm": 85, "instruments": ["strings", "piano", "flute"]},
            "lo-fi": {"genre": "hip-hop", "mood": "relaxed", "bpm": 88, "instruments": ["piano", "synth", "drums"]},
            "cinematic": {"genre": "classical", "mood": "inspirational", "bpm": 105, "instruments": ["strings", "cello", "violin"]},
            "pop": {"genre": "electronic", "mood": "energetic", "bpm": 124, "instruments": ["synth", "bass", "drums"]},
            "rock": {"genre": "pop", "mood": "energetic", "bpm": 120, "instruments": ["guitar", "bass", "drums"]},
            "jazz": {"genre": "lo-fi", "mood": "romantic", "bpm": 80, "instruments": ["piano", "bass", "percussion"]},
            "electronic": {"genre": "ambient", "mood": "mysterious", "bpm": 110, "instruments": ["synth", "bass"]},
            "hip-hop": {"genre": "electronic", "mood": "dark", "bpm": 95, "instruments": ["bass", "drums", "synth"]},
        }

        comp = complementary_map.get(top_genre, {"genre": "ambient", "mood": "peaceful", "bpm": 90, "instruments": ["piano", "strings"]})
        recommendations.append({
            "type": "discovery",
            "title": f"🔮 Explore {comp['genre'].capitalize()}",
            "description": f"Expand your catalog with a complementary {comp['genre']} track.",
            "suggestion": comp,
        })

        # 3. Tempo Variation
        tempo_title = "⚡ Up-Tempo Energy" if avg_bpm < 100 else "🌿 Slow & Relaxing"
        target_bpm = avg_bpm + 25 if avg_bpm < 100 else max(65, avg_bpm - 25)
        recommendations.append({
            "type": "variation",
            "title": tempo_title,
            "description": f"Try creating music at a different tempo (~{target_bpm} BPM).",
            "suggestion": {
                "genre": top_genre,
                "mood": "energetic" if avg_bpm < 100 else "relaxed",
                "instruments": top_instruments,
                "bpm": target_bpm,
            },
        })

        return recommendations
