"use client";

import { useTranslations } from "@/context/LocaleContext";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिन्दी" }
] as const;

export function LanguageToggle() {
  const { locale, setLocale } = useTranslations();

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
        भाषा / Lang
      </span>
      <div className="flex rounded-full border border-slate-700 p-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              locale === lang.code
                ? "bg-cyan-400 text-slate-950"
                : "text-slate-300"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
