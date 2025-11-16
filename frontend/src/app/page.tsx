"use client";

import { useMemo, useState } from "react";
import { GenreSelector, GENRES, type Genre } from "@/components/GenreSelector";
import {
  requestGeneration,
  requestPromptTranslation,
  type GenerateResponse,
  type TranslationDetails
} from "@/lib/api";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslations } from "@/context/LocaleContext";
import { PromptSuggestions } from "@/components/PromptSuggestions";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Library } from "@/components/Library";

type Tab = "generate" | "library";

export default function HomePage() {
  const { t, locale } = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [genre, setGenre] = useState<Genre>(GENRES[0].key);
  const [prompt, setPrompt] = useState("Energetic Bollywood hook with sitar and modern drums");
  const [duration, setDuration] = useState(20);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [metadata, setMetadata] = useState<
    (Pick<GenerateResponse, "bpm" | "duration" | "promptOriginal" | "promptUsed" | "translation">)
  >();
  const [translationInput, setTranslationInput] = useState("");
  const [translationOutput, setTranslationOutput] = useState<string>();
  const [translationMeta, setTranslationMeta] = useState<TranslationDetails>();
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState<string>();

  const durationLabel = useMemo(() => `${t("prompt.durationLabel")}: ${duration}s`, [duration, t]);

  async function handleGenerate() {
    setLoading(true);
    setError(undefined);
    setAudioUrl(undefined);
    try {
      const result = await requestGeneration({
        prompt: prompt.trim(),
        genre,
        duration,
        locale
      });
      setAudioUrl(result.audioPath);
      setMetadata({
        bpm: result.bpm,
        duration: result.duration,
        promptOriginal: result.promptOriginal ?? prompt,
        promptUsed: result.promptUsed ?? result.prompt ?? prompt,
        translation: result.translation
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTestTranslation() {
    const text = translationInput.trim();
    if (!text) {
      setTranslationError(t("translationTester.errorMissing"));
      setTranslationOutput(undefined);
      setTranslationMeta(undefined);
      return;
    }

    setTranslationLoading(true);
    setTranslationError(undefined);
    setTranslationOutput(undefined);

    try {
      const result = await requestPromptTranslation({
        text,
        sourceLocale: locale,
        targetLocale: "en"
      });
      setTranslationOutput(result.translatedText);
      setTranslationMeta({
        sourceLocale: result.sourceLocale,
        targetLocale: result.targetLocale,
        applied: result.applied
      });
    } catch (err) {
      setTranslationError((err as Error).message);
      setTranslationMeta(undefined);
    } finally {
      setTranslationLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-semibold">
                {t("app.tagline")}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {t("app.title")}
              </h1>
              <p className="text-base text-slate-400">{t("app.subtitle")}</p>
            </div>
            <LanguageToggle />
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mt-8 justify-center md:justify-start">
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-8 py-3.5 rounded-xl font-semibold transition-all ${
                activeTab === "generate"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
              </span>
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`px-8 py-3.5 rounded-xl font-semibold transition-all ${
                activeTab === "library"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Library
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 md:px-8 lg:px-12 py-12">
        <div className="w-full max-w-4xl">
          {activeTab === "generate" ? (
            <div className="space-y-10">
              {/* Genre Selector */}
              <section className="glass rounded-2xl p-8">
                <GenreSelector selected={genre} setSelected={setGenre} />
              </section>

              {/* Prompt Section */}
              <section className="glass rounded-2xl p-8 space-y-6">
                <h2 className="text-2xl font-bold text-slate-200 text-center">{t("prompt.sectionTitle")}</h2>
                <label className="flex flex-col gap-3">
                  <span className="text-sm font-medium text-slate-300 text-center">{t("prompt.textareaLabel")}</span>
                  <textarea
                    value={prompt}
                    onChange={(evt) => setPrompt(evt.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 p-5 text-slate-100 placeholder-slate-500 transition focus:border-cyan-500 text-center"
                    rows={4}
                    placeholder="Describe the music you want to create..."
                  />
                </label>
                <PromptSuggestions genre={genre} onSelect={setPrompt} />
                
                <label className="flex flex-col gap-3">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-medium text-slate-300">{t("prompt.durationLabel")}</span>
                    <span className="text-base font-bold text-cyan-400">{duration}s</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={60}
                    value={duration}
                    onChange={(evt) => setDuration(Number(evt.target.value))}
                  />
                </label>
                
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full max-w-md rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t("actions.generating")}
                      </span>
                    ) : (
                      t("actions.generate")
                    )}
                  </button>
                </div>
                
                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/50 p-5 mt-4">
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  </div>
                )}
              </section>
              
              {/* Translation Tester */}
              <section className="glass rounded-2xl p-8 space-y-5">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-200">{t("translationTester.title")}</h2>
                  <p className="text-sm text-slate-400">{t("translationTester.subtitle")}</p>
                </div>
                <textarea
                  value={translationInput}
                  onChange={(evt) => setTranslationInput(evt.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-slate-100 placeholder-slate-500 transition focus:border-cyan-500"
                  rows={3}
                  placeholder={t("translationTester.placeholder")}
                />
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleTestTranslation}
                    disabled={translationLoading}
                    className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {translationLoading ? t("translationTester.loading") : t("translationTester.action")}
                  </button>
                  {translationError && (
                    <p className="text-xs text-red-400 text-center">{translationError}</p>
                  )}
                </div>
                {translationOutput && (
                  <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      {t("translationTester.resultLabel")}
                    </div>
                    <p className="text-sm text-slate-100 whitespace-pre-wrap">{translationOutput}</p>
                    {translationMeta && (
                      <p className="text-xs text-slate-400">
                        {translationMeta.applied
                          ? t("translationTester.statusApplied", {
                              source: translationMeta.sourceLocale,
                              target: translationMeta.targetLocale
                            })
                          : t("translationTester.statusBypassed", {
                              target: translationMeta.targetLocale
                            })}
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* Loading Animation */}
              {loading && (
                <section className="glass rounded-2xl p-8">
                  <LoadingAnimation />
                </section>
              )}

              {/* Generated Audio Player */}
              {audioUrl && !loading && (
                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-slate-200 text-center">Your Generated Track</h2>
                  <AudioPlayer audioUrl={audioUrl} showMixerControls={true} />
                  
                  {metadata && (
                    <div className="glass rounded-xl p-6 space-y-4">
                      <h3 className="font-semibold text-cyan-400 text-lg text-center">Track Details</h3>
                      <div className="grid grid-cols-2 gap-6 text-sm max-w-md mx-auto">
                        <div className="text-center">
                          <span className="text-slate-400 block mb-1">{t("metadata.bpm")}</span>
                          <span className="text-xl font-bold text-slate-200">{metadata.bpm.toFixed(1)}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-slate-400 block mb-1">{t("metadata.duration")}</span>
                          <span className="text-xl font-bold text-slate-200">{metadata.duration}s</span>
                        </div>
                      </div>
                      
                      {metadata.translation?.applied && (
                        <div className="rounded-lg border border-slate-700 p-4 text-xs space-y-2 bg-slate-900/50 mt-4">
                          <p className="font-semibold text-cyan-400 text-center">{t("translation.title")}</p>
                          <div className="space-y-2 text-slate-300">
                            <p>
                              <span className="text-slate-400">{t("translation.original")}:</span> {metadata.promptOriginal}
                            </p>
                            <p>
                              <span className="text-slate-400">{t("translation.translated")}:</span> {metadata.promptUsed}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {t("translation.note", {
                                source: metadata.translation.sourceLocale,
                                target: metadata.translation.targetLocale
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {metadata.translation?.error && (
                        <p className="text-xs text-amber-400 text-center">
                          {t("translation.error")} ({metadata.translation.error})
                        </p>
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>
          ) : (
            <Library />
          )}
        </div>
      </div>
    </main>
  );
}
