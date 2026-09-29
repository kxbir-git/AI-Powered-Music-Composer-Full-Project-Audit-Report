"""Favorites management routes."""

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.utils.helpers import paginate_params, serialize_doc, serialize_docs, utc_now
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])


@router.get("")
async def list_favorites(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """List user's favorite projects."""
    skip, lim = paginate_params(page, limit)
    user_id = current_user["_id"]

    total = await db.favorites.count_documents({"userId": user_id})

    favorites = await db.favorites.find(
        {"userId": user_id}
    ).sort("createdAt", -1).skip(skip).limit(lim).to_list(length=lim)

    # Get project details for each favorite
    project_ids = [ObjectId(f["projectId"]) for f in favorites]
    projects = []
    if project_ids:
        cursor = db.projects.find({"_id": {"$in": project_ids}})
        projects = await cursor.to_list(length=len(project_ids))
        projects = serialize_docs(projects)
        for p in projects:
            p["isFavorited"] = True

    return {
        "favorites": projects,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + lim - 1) // lim,
    }


@router.post("")
async def add_favorite(
    project_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Add a project to favorites."""
    user_id = current_user["_id"]

    # Verify project exists and belongs to user
    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "userId": user_id,
    })
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if already favorited
    existing = await db.favorites.find_one({
        "userId": user_id,
        "projectId": project_id,
    })
    if existing:
        return {"message": "Already in favorites", "id": str(existing["_id"])}

    result = await db.favorites.insert_one({
        "userId": user_id,
        "projectId": project_id,
        "createdAt": utc_now(),
    })

    # Update user stats
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"stats.totalFavorites": 1}},
    )

    return {"message": "Added to favorites", "id": str(result.inserted_id)}


@router.delete("/{favorite_id}")
async def remove_favorite(
    favorite_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Remove a project from favorites."""
    user_id = current_user["_id"]

    # Try by favorite ID
    result = await db.favorites.delete_one({
        "_id": ObjectId(favorite_id),
        "userId": user_id,
    })

    if result.deleted_count == 0:
        # Try by project ID
        result = await db.favorites.delete_one({
            "projectId": favorite_id,
            "userId": user_id,
        })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"stats.totalFavorites": -1}},
    )

    return {"message": "Removed from favorites"}
