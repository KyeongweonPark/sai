import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const pinAttempts=sqliteTable("pin_attempts",{id:text("id").primaryKey(),attempts:integer("attempts").notNull(),expires:integer("expires").notNull()});
export const sessionTickets=sqliteTable("session_tickets",{id:text("id").primaryKey(),expires:integer("expires").notNull()});
export const textSessions=sqliteTable("text_sessions",{id:text("id").primaryKey(),expires:integer("expires").notNull()});
