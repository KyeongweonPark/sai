import type { FormEvent } from "react";
import { LockKeyhole } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import type { InterpreterCopy } from "../lib/copy";

type Props = {
  checking: boolean;
  copy: InterpreterCopy;
  error: string;
  open: boolean;
  pin: string;
  onOpenChange: (open: boolean) => void;
  onPinChange: (pin: string) => void;
  onSubmit: () => void;
};

/** PIN 입력 UI는 인증 요청과 분리되어 표시 상태와 입력값만 전달합니다. */
export function PinDialog({ checking, copy, error, open, pin, onOpenChange, onPinChange, onSubmit }: Props) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="settings-dialog" showCloseButton={!checking}>
        <div className="pin-icon"><LockKeyhole size={27} /></div>
        <DialogTitle>{copy.pinTitle}</DialogTitle>
        <DialogDescription>{copy.pinDesc}</DialogDescription>
        <form className="pin-form" onSubmit={submit}>
          <InputOTP
            autoFocus aria-label={copy.pinTitle} maxLength={4} inputMode="numeric"
            pattern="[0-9]*" value={pin}
            onChange={(value) => onPinChange(value.replace(/\D/g, ""))}
            disabled={checking} containerClassName="pin-boxes"
          >
            <InputOTPGroup>{[0, 1, 2, 3].map((index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
          </InputOTP>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="start-button" disabled={pin.length !== 4 || checking}>
            {checking ? copy.checking : copy.confirm}
          </button>
        </form>
        <p className="key-note">{copy.pinNote}</p>
      </DialogContent>
    </Dialog>
  );
}
