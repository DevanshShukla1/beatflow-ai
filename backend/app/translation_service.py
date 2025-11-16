"""Runtime translation helpers using Lingo.dev Engine."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Optional, Dict, Any, Awaitable, Callable, TypeVar

from lingodotdev.engine import LingoDotDevEngine


@dataclass
class TranslationRequest:
    text: str
    source_locale: str
    target_locale: str


class TranslationError(Exception):
    """Raised when the translation API cannot return a result."""


async def _translate_async(
    request: TranslationRequest,
    *,
    api_key: str,
    api_url: Optional[str],
) -> str:
    engine_config: Dict[str, Any] = {"api_key": api_key}
    if api_url:
        engine_config["api_url"] = api_url

    async with LingoDotDevEngine(engine_config) as engine:
        result = await engine.localize_text(
            request.text,
            {
                "source_locale": request.source_locale,
                "target_locale": request.target_locale,
                "fast": True,
            },
        )
        if isinstance(result, str):
            return result
        if isinstance(result, dict):
            # SDK may return {"text": "..."} for structured responses
            text_value = result.get("text")
            if isinstance(text_value, str):
                return text_value
        return request.text


_T = TypeVar("_T")


def _run_asyncio_task(factory: Callable[[], Awaitable[_T]]) -> _T:
    try:
        return asyncio.run(factory())
    except RuntimeError as exc:
        if "asyncio.run() cannot be called from a running event loop" not in str(exc):
            raise
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(factory())
        finally:
            loop.close()


def translate_text(
    request: TranslationRequest,
    *,
    api_url: str,
    api_key: Optional[str],
    timeout: float = 15.0,
) -> str:
    """Translate text via Lingo.dev SDK if credentials exist."""
    if not api_key or request.source_locale == request.target_locale:
        return request.text

    try:
        return _run_asyncio_task(
            lambda: _translate_async(
                request,
                api_key=api_key,
                api_url=api_url,
            )
        )
    except (ValueError, RuntimeError) as exc:
        raise TranslationError(str(exc)) from exc

