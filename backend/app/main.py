"""FastAPI application entry point.

- Sets up CORS for the frontend.
- Includes routers for authentication, health check, music generation, projects, recommendations, audio analysis, and favorites.
- Auto-connects to MongoDB on startup.
- Provides OpenAPI docs at /docs.
"""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import Settings, get_settings
from app.database.mongodb import mongodb
from app.routes import analyzer, auth, favorites, health, music, projects, recommendations


def create_app() -> FastAPI:
    settings: Settings = get_settings()
    app = FastAPI(title="AI‑Powered Music Composer API", version="1.0.0")

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Startup & Shutdown lifecycle events
    @app.on_event("startup")
    async def startup_event():
        try:
            await mongodb.connect()
        except Exception as e:
            print(f"[Startup] MongoDB connection notice: {e}")

    @app.on_event("shutdown")
    async def shutdown_event():
        await mongodb.close()

    # Include all API routers
    app.include_router(auth.router)
    app.include_router(health.router)
    app.include_router(music.router)
    app.include_router(projects.router)
    app.include_router(recommendations.router)
    app.include_router(analyzer.router)
    app.include_router(favorites.router)

    # Serve uploaded audio/storage files at /storage/*
    uploads_path = Path(settings.storage_local_path).resolve()
    uploads_path.mkdir(parents=True, exist_ok=True)
    app.mount("/storage", StaticFiles(directory=str(uploads_path)), name="storage")

    return app


app = create_app()
