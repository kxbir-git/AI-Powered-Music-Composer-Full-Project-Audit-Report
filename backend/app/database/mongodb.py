"""MongoDB async connection using Motor."""

from __future__ import annotations

from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import get_settings


class MongoDB:
    """MongoDB connection manager."""

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    async def connect(self) -> None:
        """Establish MongoDB connection and create indexes."""
        settings = get_settings()
        self.client = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=3000)
        self.db = self.client[settings.mongodb_db_name]
        try:
            await self._create_indexes()
            print(f"[MongoDB] Connected to database: {settings.mongodb_db_name}")
        except Exception as e:
            print(f"[MongoDB] Index creation notice: {e}")

    async def close(self) -> None:
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            print("[MongoDB] Connection closed")

    async def _create_indexes(self) -> None:
        """Create database indexes for performance."""
        if self.db is None:
            return

        # Users collection
        await self.db.users.create_index("email", unique=True)

        # Projects collection
        await self.db.projects.create_index("userId")
        await self.db.projects.create_index("createdAt")

        # Favorites collection
        await self.db.favorites.create_index("userId")


# Singleton instance
mongodb = MongoDB()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get the database instance."""
    if mongodb.db is None:
        try:
            await mongodb.connect()
        except Exception as e:
            print(f"[MongoDB Error] Connection failed: {e}")
            raise RuntimeError(
                f"Cannot connect to MongoDB at {get_settings().mongodb_url}. "
                "Please make sure MongoDB is installed and running, or start it via docker-compose."
            ) from e
    return mongodb.db
