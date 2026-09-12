import { env } from "cloudflare:workers";

type BoundStatement = {
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
};

type PreparedStatement = {
  bind(...values: unknown[]): BoundStatement;
};

export type InterpreterDatabase = {
  prepare(sql: string): PreparedStatement;
};

export type RuntimeBindings = {
  DB?: InterpreterDatabase;
  OPENAI_API_KEY?: string;
  INTERPRETER_PIN?: string;
};

/** Cloudflare 바인딩 접근을 한곳에 모아 API 라우트가 런타임 구현에 의존하지 않게 합니다. */
export function getRuntime() {
  return env as unknown as RuntimeBindings;
}
/** PIN과 세션 토큰은 원문을 DB에 저장하지 않고 SHA-256 해시로만 비교합니다. */
export async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
