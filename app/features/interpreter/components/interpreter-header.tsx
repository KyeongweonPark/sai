import { AudioLines, Languages, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { InterpreterCopy } from "../lib/copy";
import type { Locale } from "../types";
import { LANGUAGES, LANGUAGE_CODES } from "../lib/languages";

type Props = {
  copy: InterpreterCopy;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  disabled?: boolean;
};

/** 앱 식별, 언어 선택, PIN 보호 상태를 보여주는 공통 상단 영역입니다. */
export function InterpreterHeader({ copy, locale, onLocaleChange, disabled }: Props) {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="sai">
        <span className="brand-icon"><AudioLines size={23} /></span>
        <b>sai<span className="brand-jp">사이</span></b>
      </Link>
      <div className="top-right">
        <span className="top-caption">{copy.title}</span>
        <Select value={locale} disabled={disabled} onValueChange={(value) => onLocaleChange(value as Locale)}>
          <SelectTrigger className="locale-select" aria-label={copy.lang}>
            <Languages size={17} /><SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {LANGUAGE_CODES.map((code) => <SelectItem key={code} value={code}>{LANGUAGES[code].name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="privacy-badge"><LockKeyhole size={17} />{copy.pin}</span>
      </div>
    </header>
  );
}
