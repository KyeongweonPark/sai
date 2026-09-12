import type { RefObject } from "react";
import { ArrowLeftRight, Send } from "lucide-react";

import type { InterpreterCopy } from "../lib/copy";
import type { ConversationMessage, Locale } from "../types";

type Props = {
  copy: InterpreterCopy;
  messages: ConversationMessage[];
  bottomRef: RefObject<HTMLDivElement | null>;
  sourceLanguage: Locale;
  targetLanguage: Locale;
};

const GREETINGS: Record<Locale, string> = { ko: "안녕하세요.", en: "Hello.", fr: "Bonjour.", de: "Hallo.", ja: "こんにちは。", zh: "你好。" };
/** 대화 내역 렌더링만 담당하며 네트워크나 연결 상태를 알지 않습니다. */
export function ConversationPanel({ copy, messages, bottomRef, sourceLanguage, targetLanguage }: Props) {
  return (
    <div className="conversation" role="log" aria-live="polite">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-mark"><Send size={39} strokeWidth={1.4} /></div>
          <h2>{copy.empty}</h2>
          <p>{copy.emptyBody}</p>
          <div className="example">
            <span lang={sourceLanguage}>{GREETINGS[sourceLanguage]}</span><ArrowLeftRight size={15} />
            <span lang={targetLanguage}>{GREETINGS[targetLanguage]}</span><small>{copy.example}</small>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          return (
            <article key={message.id} className={`message ${message.role}`}>
              <div className="message-meta">
                {message.role === "user" ? copy.source : copy.translation}
              </div>
              {/* 짧은 라틴 문자나 한자만으로 언어를 추측하면 잘못된 언어 라벨이 붙을 수 있습니다. */}
              <div className="bubble">{message.text || copy.hearing}</div>
            </article>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}
