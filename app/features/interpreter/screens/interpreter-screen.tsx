"use client";

import { ArrowLeftRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languageLabel, LANGUAGES, LANGUAGE_CODES } from "../lib/languages";
import type { Locale } from "../types";

import { ConversationPanel } from "../components/conversation-panel";
import { InterpreterControls } from "../components/interpreter-controls";
import { InterpreterHeader } from "../components/interpreter-header";
import { PinDialog } from "../components/pin-dialog";
import { useInterpreter } from "../hooks/use-interpreter";

/**
 * 통역 기능의 조립 지점입니다.
 * Supaplate의 screen 패턴처럼 라우트는 이 화면 하나만 렌더링하고,
 * 상태/통신은 훅에, 세부 표현은 components에 맡깁니다.
 */
export function InterpreterScreen() {
  const {
    active, audioBlocked, audioRef, bottomRef, changePinDialog, checkingPin,
    connecting, copy, disconnect, enableAudio, error, input, locale, messages,
    openPinDialog, phaseText, pin, pinDialogOpen, pinError, sendText, setInput,
    setLocale, setPin, setSoundEnabled, soundEnabled, submitPin, textBusy,
    targetLanguage, setTargetLanguage,
  } = useInterpreter();

  return (
    <div className="shell">
      <InterpreterHeader copy={copy} locale={locale} onLocaleChange={setLocale} disabled={checkingPin} />
      <main className="workspace">
        <div className="page-heading">
          <div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.heading}</h1></div>
          <span className={`connection ${active ? "on" : ""}`}>
            <i />{active ? copy.connected : connecting ? copy.connecting : copy.offline}
          </span>
        </div>
        <section className="chat-card" aria-label={copy.title}>
          <div className="language-bar">
            <div><span className="language-symbol ko">{LANGUAGES[locale].symbol}</span><span>{LANGUAGES[locale].name}</span></div>
            <ArrowLeftRight className="swap" size={20} />
            <Select value={targetLanguage} disabled={checkingPin} onValueChange={(value) => setTargetLanguage(value as Locale)}>
              <SelectTrigger className="locale-select" aria-label={copy.translation}><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGE_CODES.filter((code) => code !== locale).map((code) => <SelectItem key={code} value={code}>{languageLabel(locale, code)}</SelectItem>)}</SelectContent>
            </Select>
            <span className="auto-label">{copy.auto}</span>
          </div>
          <ConversationPanel copy={copy} messages={messages} bottomRef={bottomRef} sourceLanguage={locale} targetLanguage={targetLanguage} />
          <InterpreterControls
            active={active}
            audioBlocked={audioBlocked}
            connecting={connecting}
            copy={copy}
            error={error}
            input={input}
            phaseText={phaseText}
            soundEnabled={soundEnabled}
            textBusy={textBusy}
            onAudioEnable={enableAudio}
            onInputChange={setInput}
            onPrimaryAction={active || connecting ? disconnect : openPinDialog}
            onSoundChange={setSoundEnabled}
            onSubmit={sendText}
          />
        </section>
        <footer className="footnote"><span>{copy.based}</span><span>{copy.retained}</span></footer>
      </main>
      <audio ref={audioRef} autoPlay hidden />
      <PinDialog
        checking={checkingPin}
        copy={copy}
        error={pinError}
        open={pinDialogOpen}
        pin={pin}
        onOpenChange={changePinDialog}
        onPinChange={setPin}
        onSubmit={submitPin}
      />
    </div>
  );
}
