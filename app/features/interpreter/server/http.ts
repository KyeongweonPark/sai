import type { Locale } from "../types";

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
/** 브라우저에서 다른 출처가 PIN API를 호출하는 단순 CSRF 요청을 차단합니다. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export function localized(
  locale: Locale | unknown,
  ko: string,
  ja: string,
  en: string,
) {
  return locale === "ja" ? ja : locale === "en" ? en : ko;
}
