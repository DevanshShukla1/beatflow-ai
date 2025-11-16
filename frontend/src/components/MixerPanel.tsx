"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useTranslations } from "@/context/LocaleContext";

interface MixerPanelProps {
  audioUrl?: string;
}

export function MixerPanel({ audioUrl }: MixerPanelProps) {
  const playerRef = useRef<Tone.Player | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const [volume, setVolume] = useState(-6);
  const [filter, setFilter] = useState(18000);
  const { t } = useTranslations();

  useEffect(() => {
    return () => {
      playerRef.current?.dispose();
      filterRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!audioUrl) return;

    async function loadClip() {
      await Tone.start();
      playerRef.current?.dispose();
      filterRef.current?.dispose();

      const filterNode = new Tone.Filter(filter, "lowpass").toDestination();
      const player = new Tone.Player(audioUrl)
        .set({ loop: true, autostart: true, volume })
        .connect(filterNode);

      playerRef.current = player;
      filterRef.current = filterNode;
    }

    loadClip();
  }, [audioUrl]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.frequency.value = filter;
    }
  }, [filter]);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{t("mixer.title")}</h2>
      <div className="flex flex-col gap-4 md:flex-row">
        <label className="flex-1">
          <span className="text-sm text-slate-400">{t("mixer.volume")}</span>
          <input
            type="range"
            min={-24}
            max={6}
            value={volume}
            onChange={(evt) => setVolume(Number(evt.target.value))}
            className="w-full"
          />
        </label>
        <label className="flex-1">
          <span className="text-sm text-slate-400">{t("mixer.filter")}</span>
          <input
            type="range"
            min={200}
            max={20000}
            value={filter}
            onChange={(evt) => setFilter(Number(evt.target.value))}
            className="w-full"
          />
        </label>
      </div>
      {!audioUrl && (
        <p className="text-sm text-slate-500">{t("mixer.placeholder")}</p>
      )}
    </section>
  );
}
