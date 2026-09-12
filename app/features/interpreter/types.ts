/** 통역 화면과 네트워크 계층이 공유하는 최소 도메인 타입입니다. */
export type Locale = "ko" | "ja" | "en";

export type ConnectionStatus = "idle" | "connecting" | "connected";
export type ConversationPhase = "ready" | "listening" | "translating" | "speaking";

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};
export type UnlockResult = {
  ticket: string;
  textToken: string;
};

export type TranslationResult = {
  translation: string;
};
