"""Routes package — All API endpoint routers."""

from app.routes import analyzer, auth, favorites, health, music, projects, recommendations

__all__ = [
    "analyzer",
    "auth",
    "favorites",
    "health",
    "music",
    "projects",
    "recommendations",
]
