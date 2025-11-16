"""Service wrapper around MusicGen for modular reuse."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional
import uuid

import librosa
import numpy as np
import soundfile as sf
import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration


@dataclass
class GenerationResult:
    audio_path: Path
    duration_seconds: float
    bpm: float
    prompt: str
    genre: str


class MusicGenService:
    """Encapsulates prompt-to-music generation and post-processing."""

    def __init__(self, model_name: str, storage_dir: Path) -> None:
        self.model_name = model_name
        self.storage_dir = storage_dir
        self._model: Optional[MusicgenForConditionalGeneration] = None
        self._processor: Optional[AutoProcessor] = None

    def _ensure_model(self) -> None:
        if self._model is None or self._processor is None:
            self._processor = AutoProcessor.from_pretrained(self.model_name)
            self._model = MusicgenForConditionalGeneration.from_pretrained(
                self.model_name
            )
            if torch.cuda.is_available():
                self._model.to("cuda")

    def generate_clip(
        self,
        prompt: str,
        genre: str,
        duration: int,
    ) -> GenerationResult:
        self._ensure_model()

        inputs = self._processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        )
        inputs = inputs.to(self._model.device)

        audio_values = self._model.generate(
            **inputs,
            max_new_tokens=duration * 100,
        )

        waveform = self._prepare_waveform(audio_values)
        waveform = self._normalize_audio(waveform)

        filename = f"musicgen_{uuid.uuid4().hex}.wav"
        output_path = self.storage_dir / filename
        samplerate = getattr(
            self._model.config, "audio_encoder", None
        )
        target_sr = getattr(samplerate, "sampling_rate", 32000)
        sf.write(output_path, waveform, samplerate=target_sr)

        bpm = self._estimate_bpm(output_path)

        return GenerationResult(
            audio_path=output_path,
            duration_seconds=duration,
            bpm=bpm,
            prompt=prompt,
            genre=genre,
        )

    @staticmethod
    def _normalize_audio(waveform: np.ndarray, peak: float = 0.95) -> np.ndarray:
        max_abs = np.max(np.abs(waveform)) or 1.0
        return (waveform / max_abs) * peak

    @staticmethod
    def _prepare_waveform(audio_values: torch.Tensor) -> np.ndarray:
        """Convert MusicGen output tensor into (frames, channels) ndarray."""
        wav = audio_values.detach().cpu().numpy()
        if wav.ndim == 3:
            # (batch, channels, frames)
            wav = wav[0].transpose(1, 0)
        elif wav.ndim == 2:
            wav = wav[0]
        return wav.astype(np.float32)

    @staticmethod
    def _estimate_bpm(audio_path: Path) -> float:
        y, sr = librosa.load(audio_path, sr=None)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        return float(tempo)
