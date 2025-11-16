"""Application configuration and settings helpers."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import List

from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())


@dataclass(frozen=True)
class Settings:
    musicgen_model: str = os.getenv("MUSICGEN_MODEL", "facebook/musicgen-small")
    storage_dir: Path = Path(os.getenv("STORAGE_DIR", "storage"))
    max_audio_seconds: int = int(os.getenv("MAX_AUDIO_SECONDS", "10"))
    cors_origins: List[str] = field(
        default_factory=lambda: os.getenv("CORS_ORIGINS", "*").split(",")
    )
    lingo_api_url: str = os.getenv(
        "LINGO_API_URL", "https://api.lingo.dev/v1/translate"
    )
    lingo_api_key: str | None = os.getenv("LINGODOTDEV_API_KEY")
    lingo_target_locale: str = os.getenv("LINGO_TARGET_LOCALE", "en")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


def get_settings() -> Settings:
    settings = Settings()
    settings.storage_dir.mkdir(parents=True, exist_ok=True)
    return settings
