"""Authentication routes."""

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
)
from app.utils.helpers import serialize_doc, utc_now
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Register a new user."""
    # Check if email already exists
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user document
    now = utc_now()
    user_doc = {
        "name": request.name,
        "email": request.email,
        "passwordHash": hash_password(request.password),
        "role": "user",
        "profileImage": None,
        "preferences": {
            "favoriteGenres": [],
            "favoriteMoods": [],
            "favoriteInstruments": [],
            "defaultBpm": 120,
            "defaultDuration": 60,
        },
        "stats": {
            "totalGenerations": 0,
            "totalFavorites": 0,
            "totalDownloads": 0,
        },
        "createdAt": now,
        "updatedAt": now,
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate tokens
    access_token = create_access_token(user_id, request.email)
    refresh_token = create_refresh_token(user_id, request.email)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Login with email and password."""
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(request.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    access_token = create_access_token(user_id, user["email"], user.get("role", "user"))
    refresh_token = create_refresh_token(user_id, user["email"])

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    return UserResponse(
        _id=current_user["_id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user.get("role", "user"),
        profileImage=current_user.get("profileImage"),
        preferences=current_user.get("preferences", {}),
        createdAt=current_user["createdAt"].isoformat()
        if hasattr(current_user["createdAt"], "isoformat")
        else str(current_user["createdAt"]),
    )


@router.put("/me", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Update the current user's profile."""
    update_data = {}
    if request.name is not None:
        update_data["name"] = request.name
    if request.profileImage is not None:
        update_data["profileImage"] = request.profileImage
    if request.preferences is not None:
        update_data["preferences"] = request.preferences

    if update_data:
        update_data["updatedAt"] = utc_now()
        await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_data},
        )

    updated_user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    updated_user = serialize_doc(updated_user)

    return UserResponse(
        _id=updated_user["_id"],
        name=updated_user["name"],
        email=updated_user["email"],
        role=updated_user.get("role", "user"),
        profileImage=updated_user.get("profileImage"),
        preferences=updated_user.get("preferences", {}),
        createdAt=updated_user["createdAt"].isoformat()
        if hasattr(updated_user["createdAt"], "isoformat")
        else str(updated_user["createdAt"]),
    )


@router.get("/stats")
async def get_user_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Get the current user's statistics."""
    user_id = ObjectId(current_user["_id"])

    total_projects = await db.projects.count_documents({"userId": str(user_id)})
    total_favorites = await db.favorites.count_documents({"userId": str(user_id)})
    total_generations = await db.generations.count_documents({"userId": str(user_id)})

    # Get genre distribution
    pipeline = [
        {"$match": {"userId": str(user_id)}},
        {"$group": {"_id": "$genre", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    genre_stats = await db.projects.aggregate(pipeline).to_list(length=5)

    # Get mood distribution
    mood_pipeline = [
        {"$match": {"userId": str(user_id)}},
        {"$group": {"_id": "$mood", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    mood_stats = await db.projects.aggregate(mood_pipeline).to_list(length=5)

    return {
        "totalProjects": total_projects,
        "totalFavorites": total_favorites,
        "totalGenerations": total_generations,
        "genreDistribution": [{"genre": s["_id"], "count": s["count"]} for s in genre_stats if s["_id"]],
        "moodDistribution": [{"mood": s["_id"], "count": s["count"]} for s in mood_stats if s["_id"]],
    }
