import type { Locale, TranslationResult, UnlockResult } from "../types";

type ApiErrorBody = { error?: string };

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & ApiErrorBody;
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}
/** PIN 검증 결과로 음성용 1회 티켓과 문자용 세션 토큰을 받습니다. */
export async function unlockInterpreter(pin: string, locale: Locale) {
  const response = await fetch("/api/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, locale }),
    signal: AbortSignal.timeout(15_000),
  });
  return readJson<UnlockResult>(response);
}

/** WebRTC offer를 서버에 전달하고 OpenAI Realtime의 answer SDP를 받습니다. */
export async function createRealtimeSession(
  sdp: string,
  ticket: string,
  locale: Locale,
  signal: AbortSignal,
  targetLanguage: Locale,
) {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sdp, ticket, locale, sourceLanguage: locale, targetLanguage }),
    signal,
  });
  if (!response.ok) {
    const body = (await response.json()) as ApiErrorBody;
    throw new Error(body.error || "Realtime session failed");
  }
  return response.text();
}

export async function translateText(
  text: string,
  token: string,
  locale: Locale,
  targetLanguage: Locale,
) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, token, locale, sourceLanguage: locale, targetLanguage }),
    signal: AbortSignal.timeout(35_000),
  });
  return readJson<TranslationResult>(response);
}
