import type { ReactNode } from "react";

import type { Locale } from "../types";

export type InterpreterCopy = {
  title: string;
  pin: string;
  eyebrow: string;
  heading: string;
  connected: string;
  connecting: string;
  offline: string;
  korean: string;
  japanese: string;
  auto: string;
  empty: string;
  emptyBody: ReactNode;
  example: string;
  source: string;
  translation: string;
  hearing: string;
  ready: string;
  readySub: string;
  listening: string;
  translating: string;
  speaking: string;
  activeSub: string;
  start: string;
  cancel: string;
  stop: string;
  typeActive: string;
  typeInactive: string;
  headphones: string;
  sound: string;
  based: string;
  retained: string;
  pinTitle: string;
  pinDesc: string;
  checking: string;
  confirm: string;
  pinNote: ReactNode;
  audio: string;
  genericError: string;
  textError: string;
  microphonePermission: string;
  lang: string;
};

/**
 * 사용자에게 보이는 문구는 화면 컴포넌트와 분리합니다.
 * 새 언어를 추가할 때 UI 로직을 수정하지 않고 이 객체와 Locale만 확장하면 됩니다.
 */
export const COPY: Record<Locale, InterpreterCopy> = {
  ko: {
    title: "한일 실시간 통역",
    pin: "PIN 보호",
    eyebrow: "DIRECT TRANSLATION",
    heading: "우리의 대화, 언어의 경계 없이.",
    connected: "연결됨",
    connecting: "연결 중",
    offline: "연결 전",
    korean: "한국어",
    japanese: "日本語",
    auto: "자동 감지",
    empty: "메시지처럼 가볍게, 통역을 시작하세요.",
    emptyBody: <>한국어로 말하면 일본어로,<br />일본어로 말하면 한국어로 들려드려요.</>,
    example: "통역 예시",
    source: "원문",
    translation: "통역",
    hearing: "음성을 듣고 있어요…",
    ready: "대화할 준비가 되었나요?",
    readySub: "시작 버튼을 누르고 편하게 말씀하세요",
    listening: "듣고 있어요",
    translating: "통역하고 있어요",
    speaking: "통역을 들려드려요",
    activeSub: "통역이 끝나면 이어서 말씀해 주세요",
    start: "통역 시작",
    cancel: "연결 취소",
    stop: "통역 종료",
    typeActive: "말 대신 글로 입력해도 좋아요",
    typeInactive: "통역을 시작한 후 글로도 대화할 수 있어요",
    headphones: "이어폰을 사용하면 더 선명해요",
    sound: "음성 출력",
    based: "OpenAI Realtime 기반 · AI 음성 통역",
    retained: "대화는 이 창에서만 유지됩니다.",
    pinTitle: "PIN Number 입력",
    pinDesc: "4자리 PIN을 입력하면 통역이 시작됩니다.",
    checking: "확인 중…",
    confirm: "확인하고 통역 시작",
    pinNote: <>PIN 확인 후 마이크 사용을 허용해 주세요.<br />음성과 메시지는 통역을 위해 OpenAI로 전송됩니다.</>,
    audio: "통역 소리 재생 허용",
    genericError: "통역 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    textError: "문자 통역에 실패했습니다. 잠시 후 다시 입력해 주세요.",
    microphonePermission: "마이크 사용을 허용해 주세요. 브라우저 권한 설정에서 변경할 수 있습니다.",
    lang: "페이지 언어",
  },
  ja: {
    title: "日韓リアルタイム通訳",
    pin: "PIN保護",
    eyebrow: "DIRECT TRANSLATION",
    heading: "言葉の壁を越えて、会話をもっと自由に。",
    connected: "接続済み",
    connecting: "接続中",
    offline: "未接続",
    korean: "韓国語",
    japanese: "日本語",
    auto: "自動検出",
    empty: "メッセージを送るように、気軽に通訳。",
    emptyBody: <>韓国語で話すと日本語に、<br />日本語で話すと韓国語に通訳します。</>,
    example: "通訳例",
    source: "原文",
    translation: "通訳",
    hearing: "音声を聞いています…",
    ready: "会話を始めますか？",
    readySub: "開始ボタンを押して、そのまま話してください",
    listening: "聞いています",
    translating: "通訳しています",
    speaking: "通訳音声を再生しています",
    activeSub: "通訳が終わってから続けて話してください",
    start: "通訳を開始",
    cancel: "接続をキャンセル",
    stop: "通訳を終了",
    typeActive: "文字を入力して通訳することもできます",
    typeInactive: "通訳を開始すると文字でも会話できます",
    headphones: "イヤホンを使うとより明瞭です",
    sound: "音声出力",
    based: "OpenAI Realtime · AI音声通訳",
    retained: "会話はこの画面内だけに保持されます。",
    pinTitle: "PIN Numberを入力",
    pinDesc: "4桁のPINを入力すると通訳が始まります。",
    checking: "確認中…",
    confirm: "確認して通訳を開始",
    pinNote: <>PIN確認後、マイクの使用を許可してください。<br />音声とメッセージは通訳のためOpenAIに送信されます。</>,
    audio: "通訳音声の再生を許可",
    genericError: "通訳中にエラーが発生しました。しばらくしてから再試行してください。",
    textError: "文字の通訳に失敗しました。しばらくしてからもう一度入力してください。",
    microphonePermission: "マイクの使用を許可してください。",
    lang: "表示言語",
  },
  en: {
    title: "Korean–Japanese Live Interpreter",
    pin: "PIN protected",
    eyebrow: "DIRECT TRANSLATION",
    heading: "One conversation, beyond language barriers.",
    connected: "Connected",
    connecting: "Connecting",
    offline: "Not connected",
    korean: "Korean",
    japanese: "Japanese",
    auto: "Auto detect",
    empty: "Translate as easily as sending a message.",
    emptyBody: <>Speak Korean to hear Japanese,<br />or Japanese to hear Korean.</>,
    example: "Example",
    source: "Original",
    translation: "Translation",
    hearing: "Listening to audio…",
    ready: "Ready to talk?",
    readySub: "Press Start and speak naturally",
    listening: "Listening",
    translating: "Translating",
    speaking: "Playing translation",
    activeSub: "Continue after the translation finishes",
    start: "Start interpreting",
    cancel: "Cancel",
    stop: "Stop interpreting",
    typeActive: "You can also type a message to translate",
    typeInactive: "Start interpreting to use text messages",
    headphones: "Headphones make the audio clearer",
    sound: "Voice output",
    based: "Powered by OpenAI Realtime · AI interpreting",
    retained: "This conversation stays in this window.",
    pinTitle: "Enter PIN Number",
    pinDesc: "Enter the four-digit PIN to start interpreting.",
    checking: "Checking…",
    confirm: "Verify and start",
    pinNote: <>Allow microphone access after PIN verification.<br />Audio and messages are sent to OpenAI for translation.</>,
    audio: "Allow translated audio",
    genericError: "An interpreting error occurred. Please try again shortly.",
    textError: "Text translation failed. Please try entering it again shortly.",
    microphonePermission: "Please allow microphone access in your browser settings.",
    lang: "Page language",
  },
};

export function microphoneUnavailable(locale: Locale) {
  const insecure = typeof window !== "undefined" && !window.isSecureContext;
  if (locale === "ja") {
    return insecure
      ? "マイクは localhost または HTTPS でのみ使用できます。文字通訳はこのまま利用できます。"
      : "このブラウザはマイクに対応していません。音声通訳は Chrome または Safari で開いてください。文字通訳はこのまま利用できます。";
  }
  if (locale === "en") {
    return insecure
      ? "Microphone access requires localhost or HTTPS. You can continue with text translation here."
      : "This browser does not support microphone access. Open the site in Chrome or Safari for voice interpreting; text translation is available here.";
  }
  return insecure
    ? "마이크는 localhost 또는 HTTPS에서만 사용할 수 있습니다. 문자 통역은 여기서 계속 사용할 수 있습니다."
    : "현재 브라우저는 마이크를 지원하지 않습니다. 음성 통역은 Chrome 또는 Safari에서 열고, 문자 통역은 여기서 계속 사용할 수 있습니다.";
}
