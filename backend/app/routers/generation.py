"""API routes for music generation."""
from __future__ import annotations

from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from typing import Dict, Any

from ..musicgen_service import MusicGenService
from ..translation_service import (
    TranslationError,
    TranslationRequest,
    translate_text,
)


generation_bp = Blueprint("generation", __name__)


def _build_request_context(prompt: str, genre: str, duration: int, locale: str) -> Dict[str, Any]:
    preview = prompt if len(prompt) <= 60 else f"{prompt[:57]}..."
    return {
        "genre": genre,
        "duration": duration,
        "locale": locale,
        "prompt_length": len(prompt),
        "prompt_preview": preview,
        "remote_addr": request.remote_addr,
        "user_agent": request.user_agent.string[:120],
    }


def _error_response(message: str, *, code: str, status_code: int, context: Dict[str, Any]):
    logger = current_app.logger
    log_message = f"Music generation request failed ({code}): {message}"
    if status_code >= 500:
        logger.error("%s | context=%s", log_message, context)
    else:
        logger.warning("%s | context=%s", log_message, context)
    return jsonify({"error": message, "code": code}), status_code


def _looks_non_english(text: str) -> bool:
    return any(ord(ch) > 127 for ch in text)


def _determine_source_locale(preferred_locale: str, target_locale: str, text: str) -> str:
    preferred = (preferred_locale or "").strip() or None
    target = (target_locale or "").strip() or "en"

    if preferred and preferred != target:
        return preferred

    if _looks_non_english(text):
        return "auto"

    return preferred or "auto"


@generation_bp.post("/generate")
def generate_music():
    payload = request.get_json(force=True)
    prompt: str = payload.get("prompt", "").strip()
    genre: str = payload.get("genre", "global")
    duration: int = int(payload.get("duration", 30))
    locale: str = payload.get("locale", "en")
    request_context = _build_request_context(prompt, genre, duration, locale)

    current_app.logger.info(
        "Received music generation request | context=%s", request_context
    )

    if not prompt:
        return _error_response(
            "Prompt is required",
            code="MISSING_PROMPT",
            status_code=400,
            context=request_context,
        )

    max_seconds = current_app.config["MAX_AUDIO_SECONDS"]
    if duration > max_seconds:
        return _error_response(
            f"Duration must be <= {max_seconds}",
            code="DURATION_TOO_LONG",
            status_code=400,
            context=request_context,
        )

    target_locale: str = current_app.config["LINGO_TARGET_LOCALE"]
    source_locale = _determine_source_locale(locale, target_locale, prompt)
    translation_details = {
        "sourceLocale": source_locale,
        "targetLocale": target_locale,
        "applied": False,
    }

    translated_prompt = prompt
    if (
        source_locale != target_locale
        and current_app.config.get("LINGO_API_KEY")
    ):
        current_app.logger.info(
            "Attempting prompt translation %s -> %s", locale, target_locale
        )
        try:
            translated_prompt = translate_text(
                TranslationRequest(
                    text=prompt,
                    source_locale=source_locale,
                    target_locale=target_locale,
                ),
                api_url=current_app.config["LINGO_API_URL"],
                api_key=current_app.config.get("LINGO_API_KEY"),
            )
            translation_details["applied"] = True
            current_app.logger.info(
                "Prompt translation applied successfully | original_length=%s translated_length=%s",
                len(prompt),
                len(translated_prompt),
            )
        except TranslationError as exc:
            translation_details["error"] = str(exc)
            current_app.logger.exception(
                "Prompt translation failed | context=%s", request_context
            )

    service = MusicGenService(
        model_name=current_app.config["MUSICGEN_MODEL"],
        storage_dir=current_app.config["STORAGE_DIR"],
    )

    try:
        result = service.generate_clip(
            prompt=translated_prompt,
            genre=genre,
            duration=duration,
        )
    except Exception as exc:  # pragma: no cover - surface readable error
        current_app.logger.exception(
            "Music generation failed inside MusicGenService | context=%s",
            {**request_context, "translation_applied": translation_details["applied"]},
        )
        return _error_response(
            str(exc),
            code="GENERATION_FAILED",
            status_code=500,
            context=request_context,
        )

    response = {
        "audioPath": str(result.audio_path),
        "duration": result.duration_seconds,
        "bpm": result.bpm,
        "prompt": result.prompt,
        "promptOriginal": prompt,
        "promptUsed": translated_prompt,
        "genre": result.genre,
        "locale": locale,
        "translation": translation_details,
    }

    current_app.logger.info(
        "Music generation completed successfully | context=%s | audio=%s",
        {**request_context, "translation_applied": translation_details["applied"]},
        response["audioPath"],
    )
    return jsonify(response), 201


@generation_bp.route("/translate", methods=["POST", "OPTIONS"])
def translate_prompt():
    if request.method == "OPTIONS":
        response = current_app.make_default_options_response()
        return response

    payload = request.get_json(force=True)
    text: str = payload.get("text", "").strip()
    preferred_locale = payload.get("sourceLocale") or payload.get("locale")
    target_locale = (
        payload.get("targetLocale")
        or current_app.config["LINGO_TARGET_LOCALE"]
    )
    source_locale = _determine_source_locale(preferred_locale or "", target_locale, text)

    request_context = {
        "text_length": len(text),
        "sourceLocale": source_locale,
        "targetLocale": target_locale,
        "remote_addr": request.remote_addr,
        "user_agent": request.user_agent.string[:120],
    }

    if not text:
        return _error_response(
            "Text is required",
            code="MISSING_TEXT",
            status_code=400,
            context=request_context,
        )

    api_key = current_app.config.get("LINGO_API_KEY")
    if not api_key:
        return _error_response(
            "Lingo translation is not configured",
            code="TRANSLATION_DISABLED",
            status_code=503,
            context=request_context,
        )

    try:
        translated_text = translate_text(
            TranslationRequest(
                text=text,
                source_locale=source_locale,
                target_locale=target_locale,
            ),
            api_url=current_app.config["LINGO_API_URL"],
            api_key=api_key,
        )
        applied = translated_text != text
        current_app.logger.info(
            "Standalone translation succeeded | context=%s | applied=%s",
            request_context,
            applied,
        )
        return jsonify(
            {
                "text": text,
                "translatedText": translated_text,
                "sourceLocale": source_locale,
                "targetLocale": target_locale,
                "applied": applied,
            }
        ), 200
    except TranslationError as exc:
        current_app.logger.exception(
            "Standalone translation failed | context=%s", request_context
        )
        return _error_response(
            str(exc),
            code="TRANSLATION_FAILED",
            status_code=502,
            context=request_context,
        )


@generation_bp.get("/library")
def get_library():
    """Get all generated audio files from storage."""
    storage_dir = Path(current_app.config["STORAGE_DIR"])
    
    if not storage_dir.exists():
        return jsonify({"files": []}), 200
    
    audio_files = []
    for file_path in storage_dir.glob("*.wav"):
        try:
            stat_info = file_path.stat()
            audio_files.append({
                "filename": file_path.name,
                "path": str(file_path),
                "size": stat_info.st_size,
                "created": stat_info.st_ctime,
                "modified": stat_info.st_mtime,
            })
        except Exception:
            continue
    
    # Sort by modified time, newest first
    audio_files.sort(key=lambda x: x["modified"], reverse=True)
    
    return jsonify({"files": audio_files}), 200
