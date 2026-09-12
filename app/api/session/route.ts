import { isSameOrigin, jsonError, localized } from "@/app/features/interpreter/server/http";
import { REALTIME_TRANSLATION_INSTRUCTIONS } from "@/app/features/interpreter/server/prompts";
import { getRuntime } from "@/app/features/interpreter/server/runtime";
import { consumeVoiceTicket } from "@/app/features/interpreter/server/session-store";
import type { Locale } from "@/app/features/interpreter/types";

type SessionBody = { sdp?: unknown; ticket?: unknown; locale?: Locale };

function openAIError(status: number) {
  if (status === 401) return "서버 API 연결 설정을 확인해 주세요.";
  if (status === 429) return "OpenAI API 잔액 또는 사용 한도를 확인해 주세요.";
  if (status === 403) return "이 API 키의 Realtime 모델 접근 권한을 확인해 주세요.";
  return "OpenAI 음성 연결에 실패했습니다. 모델 접근 권한을 확인하고 다시 시도해 주세요.";
}
/** 브라우저의 WebRTC offer를 OpenAI Realtime 세션으로 교환합니다. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  if (Number(request.headers.get("content-length") || 0) > 100_000) {
    return jsonError("요청이 너무 큽니다.", 413);
  }

  try {
    const raw = await request.text();
    if (raw.length > 100_000) return jsonError("요청이 너무 큽니다.", 413);
    let body: SessionBody;
    try {
      body = JSON.parse(raw) as SessionBody;
    } catch {
      return jsonError("잘못된 요청입니다.", 400);
    }

    const message = (ko: string, ja: string, en: string) => localized(body.locale, ko, ja, en);
    const { DB, OPENAI_API_KEY } = getRuntime();
    if (!DB || !OPENAI_API_KEY) {
      return jsonError(message("서버 연결 설정이 필요합니다.", "サーバーの接続設定が必要です。", "Server connection settings are required."), 503);
    }
    if (typeof body.ticket !== "string" || body.ticket.length > 100) {
      return jsonError(message("PIN 인증이 필요합니다.", "PIN認証が必要です。", "PIN verification is required."), 401);
    }
    if (!(await consumeVoiceTicket(DB, body.ticket, Math.floor(Date.now() / 1000)))) {
      return jsonError(message("PIN 인증이 만료되었습니다. 다시 입력해 주세요.", "PIN認証の有効期限が切れました。もう一度入力してください。", "PIN verification has expired. Please enter it again."), 401);
    }
    if (typeof body.sdp !== "string" || !body.sdp.startsWith("v=0")) {
      return jsonError("음성 연결 요청이 올바르지 않습니다.", 400);
    }

    // Realtime 세션 설정은 서버에만 두어 모델, 음성, VAD 정책을 클라이언트와 분리합니다.
    const session = {
      type: "realtime",
      model: "gpt-realtime-2.1",
      instructions: REALTIME_TRANSLATION_INSTRUCTIONS,
      output_modalities: ["audio"],
      audio: {
        input: {
          transcription: { model: "gpt-4o-mini-transcribe" },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 650,
            create_response: true,
            interrupt_response: false,
          },
        },
        output: { voice: "marin" },
      },
    };
    const form = new FormData();
    form.set("sdp", body.sdp);
    form.set("session", JSON.stringify(session));

    const result = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
      signal: AbortSignal.timeout(20_000),
    });
    if (!result.ok) {
      await result.body?.cancel();
      return jsonError(openAIError(result.status), result.status === 401 ? 401 : 502);
    }
    return new Response(await result.text(), {
      headers: { "Content-Type": "application/sdp", "Cache-Control": "no-store" },
    });
  } catch {
    return jsonError("음성 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }
}
