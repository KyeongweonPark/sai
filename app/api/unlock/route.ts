import { isSameOrigin, jsonError, localized } from "@/app/features/interpreter/server/http";
import { getRuntime } from "@/app/features/interpreter/server/runtime";
import {
  createAccessTokens,
  isPinValid,
  MAX_PIN_ATTEMPTS,
  PIN_WINDOW_SECONDS,
  pinRateLimitId,
  purgeExpiredSessions,
  recordFailedPinAttempt,
  resetPinAttempts,
} from "@/app/features/interpreter/server/session-store";
import type { Locale } from "@/app/features/interpreter/types";

type UnlockBody = { pin?: unknown; locale?: Locale };

/** PIN을 검증하고 용도와 수명이 다른 음성/문자 인증 토큰을 발급합니다. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);

  try {
    const { DB, INTERPRETER_PIN, OPENAI_API_KEY } = getRuntime();
    if (!DB || !INTERPRETER_PIN || !OPENAI_API_KEY) {
      return jsonError("서버 연결 설정이 필요합니다. 관리자에게 문의해 주세요.", 503);
    }

    const raw = await request.text();
    if (raw.length > 256) return jsonError("요청이 너무 큽니다.", 413);
    let body: UnlockBody;
    try {
      body = JSON.parse(raw) as UnlockBody;
    } catch {
      return jsonError("PIN을 입력해 주세요.", 400);
    }

    const now = Math.floor(Date.now() / 1000);
    const clientId = await pinRateLimitId(request);
    await purgeExpiredSessions(DB, now);

    if (!(await isPinValid(body.pin, INTERPRETER_PIN))) {
      const attempt = await recordFailedPinAttempt(DB, clientId, now + PIN_WINDOW_SECONDS);
      if (!attempt || attempt.attempts >= MAX_PIN_ATTEMPTS) {
        return jsonError(localized(body.locale,
          "PIN 입력 횟수를 초과했습니다. 15분 후 다시 시도해 주세요.",
          "PINの入力回数を超えました。15分後に再試行してください。",
          "Too many PIN attempts. Please try again in 15 minutes.",
        ), 429);
      }
      return jsonError(localized(body.locale,
        "PIN이 올바르지 않습니다. 다시 입력해 주세요.",
        "PINが正しくありません。もう一度入力してください。",
        "The PIN is incorrect. Please try again.",
      ), 401);
    }

    // 올바른 PIN을 입력하면 같은 클라이언트의 실패 횟수를 즉시 초기화합니다.
    await resetPinAttempts(DB, clientId);
    return Response.json(await createAccessTokens(DB, now), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return jsonError("PIN 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.", 503);
  }
}
