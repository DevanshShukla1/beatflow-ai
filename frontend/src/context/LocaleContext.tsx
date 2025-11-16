"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import en from "../../locales/en.json";
import hi from "../../locales/hi.json";

type Dictionaries = {
  en: typeof en;
  hi: typeof hi;
};

type Locale = keyof Dictionaries;

type TemplateArgs = Record<string, string | number>;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TemplateArgs) => string;
  tList: (key: string) => string[];
};

const dictionaries: Dictionaries = { en, hi };

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const resolveToken = (dict: Record<string, unknown>, key: string) => {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
};

const applyTemplate = (value: string, params?: TemplateArgs) => {
  if (!params) return value;
  return Object.entries(params).reduce(
    (acc, [token, substitution]) =>
      acc.replaceAll(`{${token}}`, String(substitution)),
    value
  );
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const value = useMemo<LocaleContextValue>(() => {
    const dict = dictionaries[locale] as Record<string, unknown>;
    return {
      locale,
      setLocale,
      t: (key: string, params?: TemplateArgs) => {
        const resolved = resolveToken(dict, key);
        if (Array.isArray(resolved)) {
          const fallback = resolved[0];
          return typeof fallback === "string"
            ? applyTemplate(fallback, params)
            : key;
        }
        if (typeof resolved === "string") {
          return applyTemplate(resolved, params);
        }
        return key;
      },
      tList: (key: string) => {
        const resolved = resolveToken(dict, key);
        return Array.isArray(resolved)
          ? resolved
          : typeof resolved === "string"
          ? [resolved]
          : [];
      }
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslations() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useTranslations must be used within LocaleProvider");
  }
  return context;
}

export type { Locale };
