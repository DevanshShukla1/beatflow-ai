"use client";

import type { Dispatch, SetStateAction } from "react";
import { useTranslations } from "@/context/LocaleContext";

export const GENRES = [
  {
    key: "bollywood",
    labelKey: "genres.bollywood.title",
    moodKey: "genres.bollywood.mood"
  },
  {
    key: "afrobeat",
    labelKey: "genres.afrobeat.title",
    moodKey: "genres.afrobeat.mood"
  },
  {
    key: "kpop",
    labelKey: "genres.kpop.title",
    moodKey: "genres.kpop.mood"
  },
  {
    key: "global",
    labelKey: "genres.global.title",
    moodKey: "genres.global.mood"
  }
] as const;

export type Genre = (typeof GENRES)[number]["key"];

interface GenreSelectorProps {
  selected: Genre;
  setSelected: Dispatch<SetStateAction<Genre>>;
}

export function GenreSelector({ selected, setSelected }: GenreSelectorProps) {
  const { t } = useTranslations();

  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">{t("genres.sectionTitle")}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {GENRES.map((genre) => (
          <button
            key={genre.key}
            onClick={() => setSelected(genre.key)}
            className={`rounded-xl border p-4 text-left transition ${
              selected === genre.key ? "border-cyan-400" : "border-slate-700"
            }`}
          >
            <div className="text-xl font-bold">{t(genre.labelKey)}</div>
            <p className="text-sm text-slate-400">{t(genre.moodKey)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
