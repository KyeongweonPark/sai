import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 원문 PIN이나 토큰은 저장하지 않습니다. 모든 id는 서버에서 SHA-256 해시한 값입니다.
export const pinAttempts = sqliteTable("pin_attempts", {
  id: text("id").primaryKey(),
  attempts: integer("attempts").notNull(),
  expires: integer("expires").notNull(),
});

// 음성 연결 티켓은 검증 시 삭제되는 짧은 수명의 일회용 자격 증명입니다.
export const sessionTickets = sqliteTable("session_tickets", {
  id: text("id").primaryKey(),
  expires: integer("expires").notNull(),
});

// 문자 세션은 같은 PIN 세션에서 여러 문장을 번역할 수 있도록 더 오래 유지됩니다.
export const textSessions = sqliteTable("text_sessions", {
  id: text("id").primaryKey(),
  expires: integer("expires").notNull(),
});
