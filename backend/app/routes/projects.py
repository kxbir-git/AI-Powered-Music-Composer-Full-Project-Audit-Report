"""Project management routes."""

from __future__ import annotations

from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.schemas.music import UpdateProjectRequest
from app.utils.helpers import paginate_params, serialize_doc, serialize_docs, utc_now
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/music/projects", tags=["Projects"])


@router.get("")
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    genre: Optional[str] = None,
    mood: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "createdAt",
    order: str = "desc",
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """List user's projects with filtering, searching, and pagination."""
    skip, limit = paginate_params(page, limit)
    user_id = current_user["_id"]

    query = {"userId": user_id}

    if genre:
        query["genre"] = genre
    if mood:
        query["mood"] = mood
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"prompt": {"$regex": search, "$options": "i"}},
        ]

    sort_direction = -1 if order == "desc" else 1
    sort_field = sort if sort in ["createdAt", "updatedAt", "title", "bpm", "duration"] else "createdAt"

    total = await db.projects.count_documents(query)
    cursor = db.projects.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit)
    projects = await cursor.to_list(length=limit)

    return {
        "projects": serialize_docs(projects),
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit,
    }


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Get a single project by ID."""
    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "userId": current_user["_id"],
    })

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project = serialize_doc(project)

    # Check if favorited
    favorite = await db.favorites.find_one({
        "userId": current_user["_id"],
        "projectId": project_id,
    })
    project["isFavorited"] = favorite is not None

    # Get generation history for this project
    generations = await db.generations.find(
        {"projectId": project_id}
    ).sort("createdAt", -1).to_list(length=10)

    project["generations"] = serialize_docs(generations)

    return project


@router.put("/{project_id}")
async def update_project(
    project_id: str,
    request: UpdateProjectRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Update project metadata."""
    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "userId": current_user["_id"],
    })

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = {}
    if request.title is not None:
        update_data["title"] = request.title
    if request.description is not None:
        update_data["description"] = request.description
    if request.coverImage is not None:
        update_data["coverImage"] = request.coverImage

    if update_data:
        update_data["updatedAt"] = utc_now()
        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": update_data},
        )

    updated = await db.projects.find_one({"_id": ObjectId(project_id)})
    return serialize_doc(updated)


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Delete a project and its associated data."""
    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "userId": current_user["_id"],
    })

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Delete associated records
    await db.generations.delete_many({"projectId": project_id})
    await db.favorites.delete_many({"projectId": project_id})
    await db.generation_history.delete_many({"projectId": project_id})
    await db.projects.delete_one({"_id": ObjectId(project_id)})

    return {"message": "Project deleted successfully"}


@router.post("/{project_id}/duplicate")
async def duplicate_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Duplicate a project."""
    original = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "userId": current_user["_id"],
    })

    if not original:
        raise HTTPException(status_code=404, detail="Project not found")

    now = utc_now()
    duplicate = {
        **original,
        "title": f"{original['title']} (Copy)",
        "createdAt": now,
        "updatedAt": now,
    }
    del duplicate["_id"]

    result = await db.projects.insert_one(duplicate)
    new_project = await db.projects.find_one({"_id": result.inserted_id})
    return serialize_doc(new_project)
