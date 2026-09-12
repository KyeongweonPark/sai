import type { RefObject } from "react";
import { ArrowLeftRight, Send } from "lucide-react";

import type { InterpreterCopy } from "../lib/copy";
import type { ConversationMessage } from "../types";

type Props = {
  copy: InterpreterCopy;
  messages: ConversationMessage[];
  bottomRef: RefObject<HTMLDivElement | null>;
};

function messageLanguage(text: string) {
  if (/[가-힣]/.test(text)) return "ko";
  if (/[ぁ-ヿ一-龯]/.test(text)) return "ja";
  return undefined;
}
/** 대화 내역 렌더링만 담당하며 네트워크나 연결 상태를 알지 않습니다. */
export function ConversationPanel({ copy, messages, bottomRef }: Props) {
  return (
    <div className="conversation" role="log" aria-live="polite">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-mark"><Send size={39} strokeWidth={1.4} /></div>
          <h2>{copy.empty}</h2>
          <p>{copy.emptyBody}</p>
          <div className="example">
            <span>안녕하세요.</span><ArrowLeftRight size={15} />
            <span lang="ja">こんにちは。</span><small>{copy.example}</small>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          const language = messageLanguage(message.text);
          return (
            <article key={message.id} className={`message ${message.role}`}>
              <div className="message-meta">
                {message.role === "user" ? copy.source : copy.translation}
                <span>{language === "ko" ? copy.korean : language === "ja" ? copy.japanese : ""}</span>
              </div>
              <div className="bubble" lang={language}>{message.text || copy.hearing}</div>
            </article>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}
