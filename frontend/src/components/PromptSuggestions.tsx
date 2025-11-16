"use client";

import { useTranslations } from "@/context/LocaleContext";
import type { Genre } from "@/components/GenreSelector";

const suggestionKeys: Record<Genre, string> = {
  bollywood: "prompt.suggestions.bollywood",
  afrobeat: "prompt.suggestions.afrobeat",
  kpop: "prompt.suggestions.kpop",
  global: "prompt.suggestions.global"
};

interface PromptSuggestionsProps {
  genre: Genre;
  onSelect: (value: string) => void;
}

export function PromptSuggestions({ genre, onSelect }: PromptSuggestionsProps) {
  const { t, tList } = useTranslations();
  const suggestions = tList(suggestionKeys[genre]);

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400">{t("prompt.suggestionsTitle")}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
