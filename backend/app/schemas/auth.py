"""Authentication schemas."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """User registration request."""

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    """User login request."""

    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request."""

    token: str
    new_password: str = Field(..., min_length=6, max_length=128)


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """User profile response."""

    id: str = Field(..., alias="_id")
    _id: Optional[str] = None
    name: str
    email: str
    role: str = "user"
    profileImage: Optional[str] = None
    preferences: dict = {}
    createdAt: str

    def __init__(self, **data):
        val = str(data.get("_id") or data.get("id") or "")
        data["id"] = val
        data["_id"] = val
        super().__init__(**data)
        self._id = val

    class Config:
        populate_by_name = True


class UpdateProfileRequest(BaseModel):
    """Update user profile request."""

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    profileImage: Optional[str] = None
    preferences: Optional[dict] = None
