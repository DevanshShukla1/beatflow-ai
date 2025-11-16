import axios from "axios";

export type TranslationDetails = {
  sourceLocale: string;
  targetLocale: string;
  applied: boolean;
  error?: string;
};

export type GenerateRequest = {
  prompt: string;
  genre: string;
  duration: number;
  locale: string;
};

export type GenerateResponse = {
  audioPath: string;
  duration: number;
  bpm: number;
  prompt: string;
  promptOriginal?: string;
  promptUsed?: string;
  locale?: string;
  translation?: TranslationDetails;
  genre: string;
};

export type TranslateRequest = {
  text: string;
  sourceLocale: string;
  targetLocale: string;
};

export type TranslateResponse = {
  text: string;
  translatedText: string;
  sourceLocale: string;
  targetLocale: string;
  applied: boolean;
};

export type LibraryFile = {
  filename: string;
  path: string;
  size: number;
  created: number;
  modified: number;
};

export type LibraryResponse = {
  files: LibraryFile[];
};

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
});

export async function requestGeneration(payload: GenerateRequest) {
  const { data } = await client.post<GenerateResponse>("/generate", payload);
  return data;
}

export async function requestPromptTranslation(payload: TranslateRequest) {
  const { data } = await client.post<TranslateResponse>("/translate", payload);
  return data;
}

export async function getLibrary() {
  const { data } = await client.get<LibraryResponse>("/library");
  return data;
}
