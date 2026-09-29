"""Modular AI Music Generation Pipeline."""

from __future__ import annotations

from typing import Any
from app.services.music_generation.musicgen import MusicGenService
from app.services.music_generation.fallback import AlgorithmicComposer


class MusicGenerationPipeline:
    """Full AI music generation pipeline: NLP -> Parameter Extraction -> Composition -> Audio Rendering."""

    def __init__(self):
        self.ai_service = MusicGenService()
        self.fallback_service = AlgorithmicComposer()

    async def generate(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """Execute the end-to-end generation pipeline."""
        # 1. NLP & Parameter Parsing
        prompt = request_data.get("prompt", "")
        if prompt and not request_data.get("genre"):
            prompt_lower = prompt.lower()
            if "relax" in prompt_lower or "chill" in prompt_lower or "study" in prompt_lower:
                request_data["mood"] = request_data.get("mood") or "relaxed"
                request_data["genre"] = request_data.get("genre") or "lo-fi"
            elif "epic" in prompt_lower or "cinematic" in prompt_lower or "movie" in prompt_lower:
                request_data["mood"] = request_data.get("mood") or "inspirational"
                request_data["genre"] = request_data.get("genre") or "cinematic"
            elif "piano" in prompt_lower:
                instruments = request_data.get("instruments") or []
                if "piano" not in instruments:
                    instruments.append("piano")
                request_data["instruments"] = instruments

        # 2. Select AI engine or fallback based on config/availability
        try:
            return await self.ai_service.generate(request_data)
        except Exception:
            return await self.fallback_service.generate(request_data)
