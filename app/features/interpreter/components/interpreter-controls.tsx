import type { FormEvent } from "react";
import { AudioLines, Headphones, Mic, Send, Square, Volume2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";

import type { InterpreterCopy } from "../lib/copy";

type Props = {
  active: boolean;
  audioBlocked: boolean;
  connecting: boolean;
  copy: InterpreterCopy;
  error: string;
  input: string;
  phaseText: string;
  soundEnabled: boolean;
  textBusy: boolean;
  onAudioEnable: () => void;
  onInputChange: (value: string) => void;
  onPrimaryAction: () => void;
  onSoundChange: (enabled: boolean) => void;
  onSubmit: () => void;
};

/** 음성 연결과 문자 입력 컨트롤을 묶되, 실제 동작은 상위 훅에 위임합니다. */
export function InterpreterControls(props: Props) {
  const {
    active, audioBlocked, connecting, copy, error, input, phaseText,
    soundEnabled, textBusy, onAudioEnable, onInputChange, onPrimaryAction,
    onSoundChange, onSubmit,
  } = props;

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="control-area">
      {error && <p className="error" role="alert">{error}</p>}
      {audioBlocked && <button className="audio-enable" onClick={onAudioEnable}>{copy.audio}</button>}
      <div className="voice-controls">
        <div className="voice-status">
          <span className={`voice-indicator ${active ? "active" : ""}`}><AudioLines size={21} /></span>
          <div>
            <strong>{active ? phaseText : connecting ? copy.connecting : copy.ready}</strong>
            <small>{active ? copy.activeSub : copy.readySub}</small>
          </div>
        </div>
        <button className={`start-button ${active ? "stop" : ""}`} onClick={onPrimaryAction}>
          {active || connecting ? <Square size={17} /> : <Mic size={19} />}
          <span>{active ? copy.stop : connecting ? copy.cancel : copy.start}</span>
        </button>
      </div>
      <form className="composer" onSubmit={submit}>
        <input
          aria-label={copy.typeActive}
          placeholder={active ? copy.typeActive : copy.typeInactive}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          disabled={!active}
          maxLength={4000}
        />
        <button type="submit" disabled={!active || textBusy || !input.trim()} aria-label={copy.translation} aria-busy={textBusy}>
          <Send size={18} />
        </button>
      </form>
      <div className="control-footer">
        <span><Headphones size={14} />{copy.headphones}</span>
        <label htmlFor="sound"><Volume2 size={15} />{copy.sound}<Switch id="sound" checked={soundEnabled} onCheckedChange={onSoundChange} /></label>
      </div>
    </div>
  );
}
