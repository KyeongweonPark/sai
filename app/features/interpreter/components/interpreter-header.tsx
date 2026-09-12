import { AudioLines, Languages, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { InterpreterCopy } from "../lib/copy";
import type { Locale } from "../types";

type Props = {
  copy: InterpreterCopy;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

/** 앱 식별, 언어 선택, PIN 보호 상태를 보여주는 공통 상단 영역입니다. */
export function InterpreterHeader({ copy, locale, onLocaleChange }: Props) {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="sai">
        <span className="brand-icon"><AudioLines size={23} /></span>
        <b>sai<span className="brand-jp">사이</span></b>
      </Link>
      <div className="top-right">
        <span className="top-caption">{copy.title}</span>
        <Select value={locale} onValueChange={(value) => onLocaleChange(value as Locale)}>
          <SelectTrigger className="locale-select" aria-label={copy.lang}>
            <Languages size={17} /><SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ko">한국어</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <span className="privacy-badge"><LockKeyhole size={17} />{copy.pin}</span>
      </div>
    </header>
  );
}
