import { digest, type InterpreterDatabase } from "./runtime";

export const PIN_WINDOW_SECONDS = 15 * 60;
export const VOICE_TICKET_SECONDS = 2 * 60;
export const TEXT_SESSION_SECONDS = 2 * 60 * 60;
export const MAX_PIN_ATTEMPTS = 5;

/** 만료 레코드를 요청 시점에 정리해 별도 스케줄러 없이 테이블 크기를 제한합니다. */
export async function purgeExpiredSessions(db: InterpreterDatabase, now: number) {
  await db.prepare("DELETE FROM pin_attempts WHERE expires < ?").bind(now).run();
  await db.prepare("DELETE FROM session_tickets WHERE expires < ?").bind(now).run();
  await db.prepare("DELETE FROM text_sessions WHERE expires < ?").bind(now).run();
}

export async function isPinValid(suppliedPin: unknown, configuredPin: string) {
  const supplied = await digest(typeof suppliedPin === "string" ? suppliedPin : "");
  const expected = await digest(configuredPin);
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

export async function recordFailedPinAttempt(
  db: InterpreterDatabase,
  clientId: string,
  expires: number,
) {
  return db.prepare(
    "INSERT INTO pin_attempts (id, attempts, expires) VALUES (?, 1, ?) " +
    "ON CONFLICT(id) DO UPDATE SET attempts = attempts + 1, expires = ? RETURNING attempts",
  ).bind(clientId, expires, expires).first<{ attempts: number }>();
}

export async function resetPinAttempts(db: InterpreterDatabase, clientId: string) {
  await db.prepare("DELETE FROM pin_attempts WHERE id = ?").bind(clientId).run();
}

export async function createAccessTokens(db: InterpreterDatabase, now: number) {
  const voiceTicket = crypto.randomUUID() + crypto.randomUUID();
  const textToken = crypto.randomUUID() + crypto.randomUUID();
  await db.prepare("INSERT INTO session_tickets (id, expires) VALUES (?, ?)")
    .bind(await digest(voiceTicket), now + VOICE_TICKET_SECONDS).run();
  await db.prepare("INSERT INTO text_sessions (id, expires) VALUES (?, ?)")
    .bind(await digest(textToken), now + TEXT_SESSION_SECONDS).run();
  return { ticket: voiceTicket, textToken };
}

/** 음성 티켓은 재사용 공격을 막기 위해 검증과 동시에 삭제하는 일회용 값입니다. */
export async function consumeVoiceTicket(
  db: InterpreterDatabase,
  ticket: string,
  now: number,
) {
  return db.prepare(
    "DELETE FROM session_tickets WHERE id = ? AND expires >= ? RETURNING id",
  ).bind(await digest(ticket), now).first();
}

export async function hasValidTextSession(
  db: InterpreterDatabase,
  token: string,
  now: number,
) {
  return db.prepare("SELECT id FROM text_sessions WHERE id = ? AND expires >= ?")
    .bind(await digest(token), now).first();
}

/** 프록시가 제공하는 IP가 없으면 사용자 에이전트 단위로 PIN 시도를 제한합니다. */
export async function pinRateLimitId(request: Request) {
  const clientKey = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("user-agent")
    || crypto.randomUUID();
  // 접두사를 바꾸면 이전 버전에서 생성한 잘못된 카운터를 안전하게 무효화할 수 있습니다.
  return digest(`pin-limit-v2:${clientKey}`);
}
