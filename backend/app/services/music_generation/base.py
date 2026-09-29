"""Abstract base class for music generation services."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class MusicGenerationService(ABC):
    """Abstract interface for AI music models and algorithmic composers."""

    @abstractmethod
    async def generate(self, params: dict[str, Any]) -> dict[str, Any]:
        """Generate audio and return metadata (urls, structure, bpm, key, etc.)."""
        pass
