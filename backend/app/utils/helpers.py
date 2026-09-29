"""General utility helpers."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


def utc_now() -> datetime:
    """Get the current UTC datetime."""
    return datetime.now(timezone.utc)


def generate_id() -> str:
    """Generate a unique identifier."""
    return uuid.uuid4().hex


def objectid_to_str(doc: dict[str, Any]) -> dict[str, Any]:
    """Convert MongoDB ObjectId fields to strings in a document."""
    if doc is None:
        return doc
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "userId" in doc and isinstance(doc["userId"], ObjectId):
        doc["userId"] = str(doc["userId"])
    if "projectId" in doc and isinstance(doc["projectId"], ObjectId):
        doc["projectId"] = str(doc["projectId"])
    return doc


def serialize_doc(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """Serialize a MongoDB document for API response."""
    if doc is None:
        return None
    doc = objectid_to_str(doc)
    # Convert datetime objects to ISO strings
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc


def serialize_docs(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Serialize a list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs if doc is not None]


def paginate_params(page: int = 1, limit: int = 20) -> tuple[int, int]:
    """Calculate skip and limit for pagination."""
    page = max(1, page)
    limit = min(max(1, limit), 100)
    skip = (page - 1) * limit
    return skip, limit
