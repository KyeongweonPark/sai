import type { Locale } from "../types";

/** UI와 서버가 동일한 허용 목록을 사용합니다. 임의의 프롬프트 입력은 받지 않습니다. */
export const LANGUAGES = {
  ko: { name: "한국어", english: "Korean", symbol: "가" },
  en: { name: "English", english: "English", symbol: "A" },
  fr: { name: "Français", english: "French", symbol: "F" },
  de: { name: "Deutsch", english: "German", symbol: "D" },
  ja: { name: "日本語", english: "Japanese", symbol: "あ" },
  zh: { name: "中文", english: "Chinese (Mandarin, Simplified Chinese)", symbol: "中" },
} as const;

export const LANGUAGE_CODES = Object.keys(LANGUAGES) as Locale[];

/** 오른쪽 언어 선택지는 상단(왼쪽) 언어 사용자가 읽는 이름으로 표시합니다. */
export const LANGUAGE_LABELS: Record<Locale, Record<Locale, string>> = {
  ko: { ko: "한국어", en: "영어", fr: "프랑스어", de: "독일어", ja: "일본어", zh: "중국어" },
  en: { ko: "Korean", en: "English", fr: "French", de: "German", ja: "Japanese", zh: "Chinese" },
  fr: { ko: "coréen", en: "anglais", fr: "français", de: "allemand", ja: "japonais", zh: "chinois" },
  de: { ko: "Koreanisch", en: "Englisch", fr: "Französisch", de: "Deutsch", ja: "Japanisch", zh: "Chinesisch" },
  ja: { ko: "韓国語", en: "英語", fr: "フランス語", de: "ドイツ語", ja: "日本語", zh: "中国語" },
  zh: { ko: "韩语", en: "英语", fr: "法语", de: "德语", ja: "日语", zh: "中文" },
};

export function languageLabel(displayLanguage: Locale, language: Locale) {
  return LANGUAGE_LABELS[displayLanguage][language];
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && Object.hasOwn(LANGUAGES, value);
}

export function isLanguagePair(source: unknown, target: unknown) {
  return isLocale(source) && isLocale(target) && source !== target;
}
