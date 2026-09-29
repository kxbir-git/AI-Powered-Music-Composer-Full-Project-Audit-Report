"""Music generation routes."""

import time
import traceback

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.schemas.music import (
    GenerateMusicRequest,
    GenerateVariationRequest,
    GenerationResponse,
    GenerationStatus,
)
from app.utils.helpers import serialize_doc, utc_now
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/music", tags=["Music Generation"])


async def _run_generation(
    generation_id: str,
    project_id: str,
    user_id: str,
    request_data: dict,
    db_name: str,
    mongodb_url: str,
):
    """Background task to generate music."""
    from motor.motor_asyncio import AsyncIOMotorClient

    client = AsyncIOMotorClient(mongodb_url)
    db = client[db_name]

    start_time = time.time()
    try:
        # Update status to processing
        await db.generations.update_one(
            {"_id": ObjectId(generation_id)},
            {"$set": {"status": "processing"}},
        )
        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": {"status": "processing"}},
        )

        # Import and run the music generation pipeline
        from app.services.music_generation.pipeline import MusicGenerationPipeline

        pipeline = MusicGenerationPipeline()
        result = await pipeline.generate(request_data)

        generation_time = time.time() - start_time

        # Update project with generated audio
        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {
                "$set": {
                    "audioUrl": result.get("audioUrl"),
                    "midiUrl": result.get("midiUrl"),
                    "duration": result.get("duration"),
                    "bpm": result.get("bpm"),
                    "key": result.get("key"),
                    "scale": result.get("scale"),
                    "instruments": result.get("instruments", []),
                    "structure": result.get("structure"),
                    "genre": result.get("genre"),
                    "mood": result.get("mood"),
                    "generationTime": generation_time,
                    "status": "completed",
                    "updatedAt": utc_now(),
                }
            },
        )

        # Update generation record
        await db.generations.update_one(
            {"_id": ObjectId(generation_id)},
            {
                "$set": {
                    "status": "completed",
                    "audioUrl": result.get("audioUrl"),
                    "generationTime": generation_time,
                    "result": result,
                }
            },
        )

        # Update user stats
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"stats.totalGenerations": 1}},
        )

        # Add to generation history
        await db.generation_history.insert_one({
            "userId": user_id,
            "projectId": project_id,
            "generationId": generation_id,
            "prompt": request_data.get("prompt"),
            "genre": result.get("genre"),
            "mood": result.get("mood"),
            "instruments": result.get("instruments", []),
            "bpm": result.get("bpm"),
            "generationTime": generation_time,
            "createdAt": utc_now(),
        })

    except Exception as e:
        generation_time = time.time() - start_time
        error_msg = str(e)
        print(f"[Error] Generation failed: {error_msg}")
        traceback.print_exc()

        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": {"status": "failed", "error": error_msg}},
        )
        await db.generations.update_one(
            {"_id": ObjectId(generation_id)},
            {
                "$set": {
                    "status": "failed",
                    "error": error_msg,
                    "generationTime": generation_time,
                }
            },
        )
    finally:
        client.close()


@router.post("/generate", response_model=GenerationResponse)
async def generate_music(
    request: GenerateMusicRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Generate music from a prompt and/or parameters."""
    from app.config.settings import get_settings

    settings = get_settings()
    user_id = current_user["_id"]
    now = utc_now()

    # Create project
    project_doc = {
        "userId": user_id,
        "title": request.title or f"Composition {now.strftime('%Y-%m-%d %H:%M')}",
        "description": request.prompt or "",
        "genre": request.genre.value if request.genre else None,
        "mood": request.mood.value if request.mood else None,
        "bpm": request.bpm,
        "key": request.key.value if request.key else None,
        "scale": request.scale.value if request.scale else None,
        "duration": request.duration,
        "instruments": [i.value for i in request.instruments] if request.instruments else [],
        "prompt": request.prompt,
        "audioUrl": None,
        "midiUrl": None,
        "coverImage": None,
        "status": "pending",
        "generationTime": None,
        "structure": None,
        "createdAt": now,
        "updatedAt": now,
    }

    project_result = await db.projects.insert_one(project_doc)
    project_id = str(project_result.inserted_id)

    # Create generation record
    generation_doc = {
        "userId": user_id,
        "projectId": project_id,
        "prompt": request.prompt,
        "parameters": {
            "genre": request.genre.value if request.genre else None,
            "mood": request.mood.value if request.mood else None,
            "instruments": [i.value for i in request.instruments] if request.instruments else [],
            "bpm": request.bpm,
            "key": request.key.value if request.key else None,
            "scale": request.scale.value if request.scale else None,
            "timeSignature": request.timeSignature.value if request.timeSignature else "4/4",
            "duration": request.duration,
            "advancedMode": request.advancedMode,
        },
        "model": settings.ai_model_type,
        "status": "pending",
        "audioUrl": None,
        "generationTime": None,
        "createdAt": now,
    }

    gen_result = await db.generations.insert_one(generation_doc)
    generation_id = str(gen_result.inserted_id)

    # Launch background generation
    request_data = generation_doc["parameters"].copy()
    request_data["prompt"] = request.prompt
    request_data["projectId"] = project_id
    request_data["generationId"] = generation_id

    background_tasks.add_task(
        _run_generation,
        generation_id,
        project_id,
        user_id,
        request_data,
        settings.mongodb_db_name,
        settings.mongodb_url,
    )

    return GenerationResponse(
        id=generation_id,
        projectId=project_id,
        status=GenerationStatus.PENDING,
        message="Music generation started. Check status for updates.",
    )


@router.get("/generate/{generation_id}/status")
async def get_generation_status(
    generation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Check the status of a music generation job."""
    generation = await db.generations.find_one({
        "_id": ObjectId(generation_id),
        "userId": current_user["_id"],
    })

    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")

    generation = serialize_doc(generation)

    # Also get the project data if completed
    project = None
    if generation.get("status") == "completed" and generation.get("projectId"):
        project = await db.projects.find_one({"_id": ObjectId(generation["projectId"])})
        project = serialize_doc(project)

    return {
        "id": generation["_id"],
        "status": generation["status"],
        "audioUrl": generation.get("audioUrl"),
        "generationTime": generation.get("generationTime"),
        "error": generation.get("error"),
        "project": project,
    }


@router.post("/variation", response_model=GenerationResponse)
async def create_variation(
    request: GenerateVariationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Create a variation of an existing track."""
    from app.config.settings import get_settings

    settings = get_settings()
    user_id = current_user["_id"]

    # Get original project
    original = await db.projects.find_one({
        "_id": ObjectId(request.projectId),
        "userId": user_id,
    })
    if not original:
        raise HTTPException(status_code=404, detail="Original project not found")

    now = utc_now()

    # Create new project as variation
    variation_doc = {
        "userId": user_id,
        "title": f"{original['title']} (Variation)",
        "description": f"Variation of '{original['title']}' - {request.variationType}",
        "genre": original.get("genre"),
        "mood": original.get("mood"),
        "bpm": original.get("bpm"),
        "key": original.get("key"),
        "scale": original.get("scale"),
        "duration": original.get("duration"),
        "instruments": original.get("instruments", []),
        "prompt": original.get("prompt"),
        "audioUrl": None,
        "midiUrl": None,
        "coverImage": None,
        "status": "pending",
        "parentProjectId": request.projectId,
        "variationType": request.variationType,
        "generationTime": None,
        "structure": None,
        "createdAt": now,
        "updatedAt": now,
    }

    project_result = await db.projects.insert_one(variation_doc)
    project_id = str(project_result.inserted_id)

    generation_doc = {
        "userId": user_id,
        "projectId": project_id,
        "prompt": original.get("prompt"),
        "parameters": {
            "genre": original.get("genre"),
            "mood": original.get("mood"),
            "instruments": original.get("instruments", []),
            "bpm": original.get("bpm"),
            "key": original.get("key"),
            "scale": original.get("scale"),
            "duration": original.get("duration"),
            "variationType": request.variationType,
            "variationParams": request.parameters,
        },
        "model": settings.ai_model_type,
        "status": "pending",
        "createdAt": now,
    }

    gen_result = await db.generations.insert_one(generation_doc)
    generation_id = str(gen_result.inserted_id)

    request_data = generation_doc["parameters"].copy()
    request_data["prompt"] = original.get("prompt")
    request_data["projectId"] = project_id
    request_data["generationId"] = generation_id
    request_data["isVariation"] = True

    background_tasks.add_task(
        _run_generation,
        generation_id,
        project_id,
        user_id,
        request_data,
        settings.mongodb_db_name,
        settings.mongodb_url,
    )

    return GenerationResponse(
        id=generation_id,
        projectId=project_id,
        status=GenerationStatus.PENDING,
        message="Variation generation started.",
    )
