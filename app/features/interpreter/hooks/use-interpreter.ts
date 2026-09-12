"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createRealtimeSession, translateText, unlockInterpreter } from "../lib/client-api";
import { COPY, microphoneUnavailable } from "../lib/copy";
import type {
  ConnectionStatus,
  ConversationMessage,
  ConversationPhase,
  Locale,
} from "../types";

type RealtimeEvent = {
  type?: string;
  item_id?: string;
  transcript?: string;
  text?: string;
  delta?: string;
  response?: { status?: string };
};

const CONNECTION_TIMEOUT_MS = 30_000;

/**
 * 통역 화면의 상태와 브라우저 자원을 한곳에서 관리합니다.
 * 화면 컴포넌트는 이 훅이 제공하는 상태와 명령만 사용하므로 WebRTC 세부 구현과 분리됩니다.
 */
export function useInterpreter() {
  const [locale, setLocale] = useState<Locale>("ko");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [phase, setPhase] = useState<ConversationPhase>("ready");
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [input, setInput] = useState("");
  const [textBusy, setTextBusy] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textTokenRef = useRef("");

  const copy = COPY[locale];
  const active = status === "connected";
  const connecting = status === "connecting";

  /** 현재 연결 세대가 소유한 브라우저 자원을 모두 해제합니다. */
  const disconnect = useCallback(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;

    channelRef.current?.close();
    channelRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }

    textTokenRef.current = "";
    setStatus("idle");
    setPhase("ready");
    setTextBusy(false);
    setAudioBlocked(false);
  }, []);

  useEffect(() => {
    const savedLocale = localStorage.getItem("sai-locale");
    if (savedLocale === "ko" || savedLocale === "ja" || savedLocale === "en") {
      // 브라우저 저장값은 hydration 이후에만 알 수 있으므로 최초 effect에서 동기화합니다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale(savedLocale);
    }
    return disconnect;
  }, [disconnect]);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem("sai-locale", locale);
  }, [locale]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = !soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateMessage = useCallback(
    (id: string | undefined, role: ConversationMessage["role"], text = "", append = false) => {
      if (!id) return;
      setMessages((current) => {
        const existing = current.find((message) => message.id === id);
        if (!existing) return [...current, { id, role, text }];
        return current.map((message) =>
          message.id === id
            ? { ...message, text: append ? message.text + text : text }
            : message,
        );
      });
    },
    [],
  );

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case "input_audio_buffer.speech_started":
          setPhase("listening");
          updateMessage(event.item_id, "user");
          break;
        case "input_audio_buffer.speech_stopped":
          setPhase("translating");
          break;
        case "conversation.item.input_audio_transcription.completed":
          updateMessage(event.item_id, "user", event.transcript);
          break;
        case "conversation.item.input_audio_transcription.failed":
          updateMessage(event.item_id, "user", copy.hearing);
          break;
        case "response.output_audio_transcript.delta":
        case "response.output_text.delta":
          updateMessage(event.item_id, "assistant", event.delta, true);
          break;
        case "response.output_audio_transcript.done":
        case "response.output_text.done":
          updateMessage(event.item_id, "assistant", event.transcript ?? event.text);
          break;
        case "response.done":
          if (event.response?.status === "failed") setError(copy.genericError);
          break;
        case "output_audio_buffer.started":
          // 번역 음성이 재생되는 동안 입력 마이크를 잠시 꺼서 에코 재입력을 막습니다.
          setPhase("speaking");
          streamRef.current?.getAudioTracks().forEach((track) => (track.enabled = false));
          break;
        case "output_audio_buffer.stopped":
        case "output_audio_buffer.cleared":
          streamRef.current?.getAudioTracks().forEach((track) => (track.enabled = true));
          setPhase("ready");
          break;
        case "error":
          setError(copy.genericError);
          disconnect();
          break;
      }
    },
    [copy.genericError, copy.hearing, disconnect, updateMessage],
  );

  async function startRealtime(ticket: string) {
    if (connecting || active) return;
    setError("");
    setStatus("connecting");
    const generation = ++generationRef.current;

    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error(microphoneUnavailable(locale));
      }

      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (generation !== generationRef.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = media;

      const peer = new RTCPeerConnection();
      peerRef.current = peer;
      media.getTracks().forEach((track) => peer.addTrack(track, media));

      peer.ontrack = ({ streams, track }) => {
        if (!audioRef.current) return;
        audioRef.current.srcObject = streams[0] ?? new MediaStream([track]);
        audioRef.current.play().catch(() => setAudioBlocked(true));
      };
      peer.onconnectionstatechange = () => {
        if (peerRef.current === peer && ["failed", "disconnected"].includes(peer.connectionState)) {
          disconnect();
          setError(copy.genericError);
        }
      };

      // OpenAI Realtime의 JSON 이벤트는 WebRTC data channel로 수신합니다.
      const channel = peer.createDataChannel("oai-events");
      channelRef.current = channel;
      channel.onopen = () => {
        if (generation !== generationRef.current) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        setStatus("connected");
        setPhase("ready");
      };
      channel.onclose = () => {
        if (peerRef.current === peer) {
          disconnect();
          setError(copy.genericError);
        }
      };
      channel.onmessage = ({ data }) => {
        try {
          handleRealtimeEvent(JSON.parse(data) as RealtimeEvent);
        } catch {
          // 알 수 없는 이벤트 하나가 전체 통역 연결을 중단시키지 않도록 무시합니다.
        }
      };

      timerRef.current = setTimeout(() => {
        if (generation === generationRef.current) {
          disconnect();
          setError(copy.genericError);
        }
      }, CONNECTION_TIMEOUT_MS);

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const controller = new AbortController();
      abortRef.current = controller;
      const answer = await createRealtimeSession(
        offer.sdp ?? "",
        ticket,
        locale,
        controller.signal,
      );
      if (generation !== generationRef.current) return;
      await peer.setRemoteDescription({ type: "answer", sdp: answer });
    } catch (caught) {
      if (generation !== generationRef.current) return;
      disconnect();
      setError(
        caught instanceof DOMException && caught.name === "NotAllowedError"
          ? copy.microphonePermission
          : caught instanceof Error
            ? caught.message
            : copy.genericError,
      );
    }
  }

  async function submitPin() {
    if (pin.length !== 4 || checkingPin) return;
    setCheckingPin(true);
    setPinError("");
    try {
      const result = await unlockInterpreter(pin, locale);
      textTokenRef.current = result.textToken;
      setPin("");
      setPinDialogOpen(false);

      // 마이크가 없는 내장 브라우저에서도 문자 통역은 계속 제공할 수 있습니다.
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatus("connected");
        setError(microphoneUnavailable(locale));
        return;
      }
      await startRealtime(result.ticket);
    } catch (caught) {
      textTokenRef.current = "";
      setPinError(caught instanceof Error ? caught.message : copy.genericError);
      setPin("");
    } finally {
      setCheckingPin(false);
    }
  }

  async function sendText() {
    const text = input.trim();
    const token = textTokenRef.current;
    if (!text || !active || textBusy || !token) return;

    updateMessage(`local_${crypto.randomUUID()}`, "user", text);
    const translationId = `translated_${crypto.randomUUID()}`;
    setInput("");
    setError("");
    setTextBusy(true);
    try {
      const result = await translateText(text, token, locale);
      updateMessage(translationId, "assistant", result.translation);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.textError);
    } finally {
      setTextBusy(false);
    }
  }

  function openPinDialog() {
    setPin("");
    setPinError("");
    setPinDialogOpen(true);
  }

  function changePinDialog(open: boolean) {
    if (checkingPin) return;
    setPinDialogOpen(open);
    setPin("");
    setPinError("");
  }

  function enableAudio() {
    audioRef.current
      ?.play()
      .then(() => setAudioBlocked(false))
      .catch(() => setError(copy.genericError));
  }

  const phaseText =
    phase === "listening"
      ? copy.listening
      : phase === "translating"
        ? copy.translating
        : phase === "speaking"
          ? copy.speaking
          : copy.ready;

  return {
    active,
    audioBlocked,
    audioRef,
    bottomRef,
    changePinDialog,
    checkingPin,
    connecting,
    copy,
    disconnect,
    enableAudio,
    error,
    input,
    locale,
    messages,
    openPinDialog,
    phaseText,
    pin,
    pinDialogOpen,
    pinError,
    sendText,
    setInput,
    setLocale,
    setPin,
    setSoundEnabled,
    soundEnabled,
    submitPin,
    textBusy,
  };
}
