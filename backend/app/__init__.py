"""Flask application factory for BeatFlow AI backend."""
from __future__ import annotations

from flask import Flask
from flask_cors import CORS
import logging

from .config import get_settings
from .routers.generation import generation_bp


def create_app() -> Flask:
    settings = get_settings()
    app = Flask(__name__)
    app.config.from_mapping(
        MUSICGEN_MODEL=settings.musicgen_model,
        MAX_AUDIO_SECONDS=settings.max_audio_seconds,
        STORAGE_DIR=settings.storage_dir,
        LINGO_API_URL=settings.lingo_api_url,
        LINGO_API_KEY=settings.lingo_api_key,
        LINGO_TARGET_LOCALE=settings.lingo_target_locale,
        LOG_LEVEL=settings.log_level,
    )

    _configure_logging(app)

    CORS(app, resources={r"/api/*": {"origins": settings.cors_origins}})

    app.register_blueprint(generation_bp, url_prefix="/api")

    @app.get("/health")
    def health_check():
        return {"status": "ok", "model": settings.musicgen_model}

    return app


def _configure_logging(app: Flask) -> None:
    """Ensure consistent logging across the application and blueprints."""
    log_level_name = str(app.config.get("LOG_LEVEL", "INFO")).upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(name)s: %(message)s"
    )

    if not app.logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)
    else:
        for handler in app.logger.handlers:
            handler.setFormatter(formatter)

    app.logger.setLevel(log_level)
    logging.basicConfig(level=log_level, format=formatter._fmt)
