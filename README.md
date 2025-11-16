# BeatFlow AI POC

BeatFlow AI blends Meta's MusicGen outputs with browser-based loop mixing to craft short-form, copyright-safe clips optimised for Reels/Shorts.

## System Inputs & Outputs

| Layer | Inputs | Outputs |
| --- | --- | --- |
| Frontend | Genre selection, text prompt describing mood/instrumentation, clip duration slider (15-60s) | API request payload, real-time Tone.js playback, downloadable clip metadata |
| Backend | JSON payload `{ prompt, genre, duration }`, environment config for model & storage | WAV file path for generated audio, BPM estimate, duration confirmation, error messages |
| Localization | Lingo.dev CLI glossary + locale JSON | Resolved UI strings per locale (e.g., Hindi, Korean) |

## Project Structure

```
beatflow-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py        # Flask factory & blueprint registration
│   │   ├── config.py          # Environment-driven settings
│   │   ├── musicgen_service.py# MusicGen model wrapper
│   │   └── routers/
│   │       └── generation.py  # /api/generate route
│   ├── requirements.txt
│   └── run.py                 # Dev server entry point
├── frontend/
│   ├── package.json
│   ├── next.config.mjs
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── GenreSelector.tsx
│       │   └── MixerPanel.tsx
│       └── lib/
│           └── api.ts
└── .gitignore
```

## Quickstart

```bash
# Backend
cd backend
../.venv/Scripts/activate  # Windows
pip install -r requirements.txt
set LINGODOTDEV_API_KEY=your_key   # or export on macOS/Linux
python run.py

# Frontend
cd ../frontend
npm install
npm run dev
```

## Lingo.dev SDK quickstart

The backend uses the official [Lingo.dev Python SDK](https://lingo.dev/en/sdk/python). If you want to test the SDK separately (for example to verify your API key), run either of these scripts from a clean virtual environment:

```
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "lingodotdev==1.3.0",
# ]
# ///

import asyncio
import os
from lingodotdev.engine import LingoDotDevEngine

async def main():
    api_key = os.environ["LINGODOTDEV_API_KEY"]

    # Translate text
    text_result = await LingoDotDevEngine.quick_translate(
        "Hello world",
        api_key=api_key,
        source_locale="hi",
        target_locale="en"
    )
    print(f"Text: {text_result}")

    # Translate object
    object_result = await LingoDotDevEngine.quick_translate(
        {"greeting": "Hello", "farewell": "Goodbye"},
        api_key=api_key,
        source_locale="en",
        target_locale="fr"
    )
    print(f"Object: {object_result}")

asyncio.run(main())
```

```
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "lingodotdev==1.3.0",
# ]
# ///

import asyncio
import os
from lingodotdev import LingoDotDevEngine

async def main():
    api_key = os.environ["LINGODOTDEV_API_KEY"]
    async with LingoDotDevEngine({"api_key": api_key}) as engine:
        result = await engine.localize_text(
            "Welcome! We missed you.",
            {"source_locale": "en", "target_locale": "es"}
        )
        print(result)

asyncio.run(main())
```

## Runtime Translation Flow

- UI language toggle (EN/हिन्दी) lives in the frontend and sends the current locale with each `/api/generate` request.
- The Flask backend calls Lingo.dev Engine (`LINGODOTDEV_API_KEY`) to translate Hindi prompts to English before they reach MusicGen, guaranteeing prompt accuracy while keeping the interface Hindi-first.
- Responses now include `promptOriginal`, `promptUsed`, and translation metadata so the frontend can surface transparency badges for judges.

## Workflow Diagram

```mermaid
flowchart LR
    A[User UI] -->|Select genre, prompt, duration| B[Next.js Frontend]
    B -->|Axios POST /api/generate| C[Flask Router]
    C -->|Validate & build job| D[MusicGenService]
    D -->|Prompt-to-audio inference| E[(MusicGen Model)]
    E -->|WAV + metadata| F[Storage + Librosa BPM]
    F -->|JSON response {audioPath,bpm}| B
    B -->|Pass URL to Tone.js| G[MixerPanel]
    G -->|Loop playback / filters| A
    B -->|Localized strings| H[Lingo.dev Locales]
```
