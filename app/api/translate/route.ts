import { isSameOrigin, jsonError, localized } from "@/app/features/interpreter/server/http";
import { TEXT_TRANSLATION_INSTRUCTIONS } from "@/app/features/interpreter/server/prompts";
import { getRuntime } from "@/app/features/interpreter/server/runtime";
import { hasValidTextSession } from "@/app/features/interpreter/server/session-store";
import type { Locale } from "@/app/features/interpreter/types";

type TranslateBody = { text?: unknown; token?: unknown; locale?: Locale };
type OpenAIResponse = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

function translationFrom(response: OpenAIResponse) {
  return response.output_text || response.output?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text")?.text;
}
/** 유효한 문자 세션에서 한국어와 일본어 사이의 단방향 번역을 수행합니다. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);

  try {
    const raw = await request.text();
    if (raw.length > 12_000) return jsonError("요청이 너무 큽니다.", 413);
    let body: TranslateBody;
    try {
      body = JSON.parse(raw) as TranslateBody;
    } catch {
      return jsonError("잘못된 요청입니다.", 400);
    }

    const message = (ko: string, ja: string, en: string) => localized(body.locale, ko, ja, en);
    if (typeof body.text !== "string" || !body.text.trim() || body.text.length > 4000) {
      return jsonError(message("통역할 문장을 입력해 주세요.", "通訳する文章を入力してください。", "Enter a message to translate."), 400);
    }
    if (typeof body.token !== "string" || body.token.length > 100) {
      return jsonError(message("PIN 인증이 필요합니다.", "PIN認証が必要です。", "PIN verification is required."), 401);
    }

    const { DB, OPENAI_API_KEY } = getRuntime();
    if (!DB || !OPENAI_API_KEY) {
      return jsonError(message("서버 연결 설정이 필요합니다.", "サーバーの接続設定が必要です。", "Server connection settings are required."), 503);
    }
    if (!(await hasValidTextSession(DB, body.token, Math.floor(Date.now() / 1000)))) {
      return jsonError(message(
        "인증이 만료되었습니다. 통역을 다시 시작해 주세요.",
        "認証の有効期限が切れました。通訳を再開してください。",
        "Authentication expired. Start interpreting again.",
      ), 401);
    }

    const result = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-5.6-terra", reasoning: { effort: "none" }, instructions: TEXT_TRANSLATION_INSTRUCTIONS, input: body.text.trim(), max_output_tokens: 1000 }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!result.ok) {
      await result.body?.cancel();
      return jsonError(message("문자 통역에 실패했습니다. 잠시 후 다시 시도해 주세요.", "文字の通訳に失敗しました。しばらくしてから再試行してください。", "Text translation failed. Please try again shortly."), 502);
    }

    const translation = translationFrom(await result.json() as OpenAIResponse);
    if (!translation) {
      return jsonError(message("통역 결과를 받지 못했습니다. 다시 시도해 주세요.", "通訳結果を取得できませんでした。もう一度お試しください。", "No translation was returned. Please try again."), 502);
    }
    return Response.json({ translation }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("문자 통역 서버에 연결하지 못했습니다.", 502);
  }
}
