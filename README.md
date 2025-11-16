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

## Runtime Translation Flow

- UI language toggle (EN/हिन्दी) lives in the frontend and sends the current locale with each `/api/generate` request.
- The Flask backend calls Lingo.dev Engine (`LINGODOTDEV_API_KEY`) to translate Hindi prompts to English before they reach MusicGen, guaranteeing prompt accuracy while keeping the interface Hindi-first.
- Responses now include `promptOriginal`, `promptUsed`, and translation metadata so the frontend can surface transparency badges for judges.

## Workflow Diagram

<img width="3125" height="2735" alt="workflow" src="https://github.com/user-attachments/assets/4dda921b-95b8-4cbb-928c-9805a62442e4" />
