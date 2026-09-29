"""File storage utilities supporting local, Cloudinary, and S3."""

from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile

from app.config.settings import get_settings


class StorageService:
    """Abstraction layer for file storage."""

    def __init__(self):
        self.settings = get_settings()
        self.storage_type = self.settings.storage_type

    async def save_file(
        self,
        file_or_content: "UploadFile | bytes | None" = None,
        file_path_or_name: str | None = None,
        content: bytes | None = None,
        folder: str = "audio",
        filename: str | None = None,
        content_type: str | None = None,
    ) -> str:
        """Save a file and return its URL/path.

        Supports two calling conventions:
        1. Keyword style: save_file(file=upload, folder=..., filename=...)
        2. Positional style: save_file(bytes_content, "name.wav", content_type="audio/wav")
        """
        file: UploadFile | None = None
        file_path: str | None = None

        # Detect positional bytes + filename pattern (used by AlgorithmicComposer)
        if isinstance(file_or_content, bytes):
            content = file_or_content
            if file_path_or_name and not filename:
                filename = file_path_or_name
        elif isinstance(file_or_content, str):
            file_path = file_or_content
        elif file_or_content is not None:
            # Assume UploadFile
            file = file_or_content

        if file_path_or_name and file_path is None and filename is None:
            # Could be a path or filename — check if it looks like a path
            if os.path.sep in file_path_or_name or "/" in file_path_or_name:
                file_path = file_path_or_name
            else:
                filename = file_path_or_name

        if filename is None:
            ext = ""
            if file and hasattr(file, 'filename') and file.filename:
                ext = Path(file.filename).suffix
            elif file_path:
                ext = Path(file_path).suffix
            filename = f"{uuid.uuid4().hex}{ext}"

        if self.storage_type == "local":
            return await self._save_local(file, file_path, content, folder, filename)
        elif self.storage_type == "cloudinary":
            return await self._save_cloudinary(file, file_path, content, folder, filename)
        elif self.storage_type == "s3":
            return await self._save_s3(file, file_path, content, folder, filename)
        else:
            raise ValueError(f"Unsupported storage type: {self.storage_type}")

    async def _save_local(
        self,
        file: UploadFile | None,
        file_path: str | None,
        content: bytes | None,
        folder: str,
        filename: str,
    ) -> str:
        """Save file to local filesystem."""
        storage_dir = Path(self.settings.storage_local_path).resolve() / folder
        storage_dir.mkdir(parents=True, exist_ok=True)

        target_path = storage_dir / filename

        if file:
            file_content = await file.read()
            target_path.write_bytes(file_content)
        elif file_path:
            shutil.copy2(file_path, str(target_path))
        elif content:
            target_path.write_bytes(content)
        else:
            raise ValueError("No file source provided")

        return f"/storage/{folder}/{filename}"

    async def _save_cloudinary(
        self,
        file: UploadFile | None,
        file_path: str | None,
        content: bytes | None,
        folder: str,
        filename: str,
    ) -> str:
        """Save file to Cloudinary (requires cloudinary package)."""
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=self.settings.cloudinary_cloud_name,
                api_key=self.settings.cloudinary_api_key,
                api_secret=self.settings.cloudinary_api_secret,
            )

            if file:
                result = cloudinary.uploader.upload(
                    await file.read(),
                    folder=folder,
                    resource_type="auto",
                )
            elif file_path:
                result = cloudinary.uploader.upload(
                    file_path,
                    folder=folder,
                    resource_type="auto",
                )
            elif content:
                result = cloudinary.uploader.upload(
                    content,
                    folder=folder,
                    resource_type="auto",
                )
            else:
                raise ValueError("No file source provided")

            return result["secure_url"]
        except ImportError:
            raise RuntimeError("cloudinary package not installed. Run: pip install cloudinary")

    async def _save_s3(
        self,
        file: UploadFile | None,
        file_path: str | None,
        content: bytes | None,
        folder: str,
        filename: str,
    ) -> str:
        """Save file to AWS S3 (requires boto3 package)."""
        try:
            import boto3

            s3 = boto3.client(
                "s3",
                aws_access_key_id=self.settings.aws_access_key_id,
                aws_secret_access_key=self.settings.aws_secret_access_key,
                region_name=self.settings.aws_region,
            )

            key = f"{folder}/{filename}"

            if file:
                s3.put_object(
                    Bucket=self.settings.aws_s3_bucket,
                    Key=key,
                    Body=await file.read(),
                )
            elif file_path:
                s3.upload_file(file_path, self.settings.aws_s3_bucket, key)
            elif content:
                s3.put_object(
                    Bucket=self.settings.aws_s3_bucket,
                    Key=key,
                    Body=content,
                )
            else:
                raise ValueError("No file source provided")

            return f"https://{self.settings.aws_s3_bucket}.s3.{self.settings.aws_region}.amazonaws.com/{key}"
        except ImportError:
            raise RuntimeError("boto3 package not installed. Run: pip install boto3")

    async def delete_file(self, file_url: str) -> bool:
        """Delete a file by its URL/path."""
        if self.storage_type == "local":
            file_path = Path(self.settings.storage_local_path) / file_url.lstrip("/storage/")
            if file_path.exists():
                file_path.unlink()
                return True
        return False

    def get_local_path(self, relative_url: str) -> Optional[str]:
        """Convert a storage URL to a local filesystem path."""
        if self.storage_type == "local":
            path = Path(self.settings.storage_local_path) / relative_url.lstrip("/storage/")
            if path.exists():
                return str(path)
        return None


# Singleton
storage_service = StorageService()
