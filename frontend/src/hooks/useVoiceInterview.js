import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/lib/api";

export function useVoiceInterview({ persona = "technical", onAutoSend } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMode, setSpeechMode] = useState("idle"); // "idle" | "loading" | "audio" | "browser"
  const [speechLevel, setSpeechLevel] = useState(0);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimText] = useState("");
  const [micError, setMicError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const silenceIntervalRef = useRef(null);
  const audioElRef = useRef(null);
  const audioUrlRef = useRef(null);
  const ttsAudioCtxRef = useRef(null);
  const ttsRafRef = useRef(null);
  const transcriptRef = useRef("");
  const mutedRef = useRef(muted);
  const rateRef = useRef(speechRate);
  const onAutoSendRef = useRef(onAutoSend);
  const autoSendAfterStopRef = useRef(false);

  const sttSupported =
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      setIsSpeaking(false);
    }
  }, [muted]);

  useEffect(() => {
    rateRef.current = speechRate;
  }, [speechRate]);

  useEffect(() => {
    onAutoSendRef.current = onAutoSend;
  }, [onAutoSend]);

  const stopTtsMeter = useCallback(() => {
    if (ttsRafRef.current) {
      window.cancelAnimationFrame(ttsRafRef.current);
      ttsRafRef.current = null;
    }
    if (ttsAudioCtxRef.current) {
      ttsAudioCtxRef.current.close().catch(() => { });
      ttsAudioCtxRef.current = null;
    }
    setSpeechLevel(0);
    setSpeechProgress(0);
    setSpeechMode("idle");
  }, []);

  const stopSpeaking = useCallback(() => {
    stopTtsMeter();
    if (audioElRef.current) {
      try {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
      } catch {
        // ignore
      }
      audioElRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setIsSpeaking(false);
  }, [stopTtsMeter]);

  const cleanupAudioMonitor = useCallback(() => {
    if (silenceIntervalRef.current) {
      window.clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
      audioContextRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    cleanupAudioMonitor();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, [cleanupAudioMonitor]);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    setTranscript("");
    setInterimText("");
  }, []);

  const updateTranscript = useCallback((val) => {
    transcriptRef.current = val;
    setTranscript(val);
    setInterimText("");
  }, []);

  const startListening = useCallback(
    async ({ autoSendOnSilence = false } = {}) => {
      if (!sttSupported) {
        setMicError("Microphone recording is not supported in this browser.");
        return;
      }
      setMicError("");
      stopSpeaking();

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        stopListening();
        return;
      }

      autoSendAfterStopRef.current = autoSendOnSilence;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";

        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          setIsListening(false);
          // Release mic tracks
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }

          const blob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          audioChunksRef.current = [];

          if (blob.size < 500) {
            return;
          }

          setIsTranscribing(true);
          setInterimText("Transcribing with ElevenLabs...");
          try {
            const form = new FormData();
            form.append("audio", blob, "answer.webm");
            const res = await api.post("/ai-interview/stt", form, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            const spoken = (res.data?.data?.text || "").trim();
            setInterimText("");
            if (spoken) {
              const next = transcriptRef.current
                ? `${transcriptRef.current.trim()} ${spoken}`
                : spoken;
              transcriptRef.current = next;
              setTranscript(next);

              if (autoSendAfterStopRef.current) {
                onAutoSendRef.current?.(next);
              }
            }
          } catch (err) {
            setInterimText("");
            setMicError(
              err.response?.data?.message ||
              "Could not transcribe audio. You can also type your answer."
            );
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start(250);
        setIsListening(true);

        if (autoSendOnSilence && typeof AudioContext !== "undefined") {
          try {
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            audioContextRef.current = audioCtx;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let hasSpoken = false;
            let lastSpeechAt = Date.now();

            silenceIntervalRef.current = window.setInterval(() => {
              if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
                return;
              }
              analyser.getByteTimeDomainData(dataArray);
              let sumSquares = 0;
              for (let i = 0; i < dataArray.length; i++) {
                const norm = (dataArray[i] - 128) / 128;
                sumSquares += norm * norm;
              }
              const rms = Math.sqrt(sumSquares / dataArray.length);
              if (rms > 0.025) {
                hasSpoken = true;
                lastSpeechAt = Date.now();
              } else if (hasSpoken && Date.now() - lastSpeechAt >= 2200) {
                stopListening();
              }
            }, 120);
          } catch {
            // ignore Web Audio monitor failure; manual stop still works
          }
        }
      } catch (err) {
        setIsListening(false);
        setMicError(
          err?.name === "NotAllowedError"
            ? "Microphone permission denied. Allow mic access or type your answer."
            : "Could not access microphone."
        );
      }
    },
    [sttSupported, stopSpeaking, stopListening]
  );

  const speakWithBrowserFallback = useCallback((text, onEnd) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rateRef.current || 1.0;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeechMode("browser");
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechMode("idle");
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechMode("idle");
      onEnd?.();
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (text, { onEnd } = {}) => {
      if (!text || mutedRef.current) {
        onEnd?.();
        return;
      }

      stopSpeaking();
      setIsSpeaking(true);
      setSpeechMode("loading");

      try {
        const res = await api.post(
          "/ai-interview/tts",
          {
            text,
            persona,
            speed: rateRef.current || 1.0,
          },
          { responseType: "blob" }
        );

        if (mutedRef.current) {
          setIsSpeaking(false);
          onEnd?.();
          return;
        }

        const url = URL.createObjectURL(res.data);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioElRef.current = audio;

        audio.ontimeupdate = () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            setSpeechProgress(Math.min(1, audio.currentTime / audio.duration));
          }
        };

        let attachedAnalyser = false;
        if (typeof AudioContext !== "undefined") {
          try {
            const ctx = new AudioContext();
            const source = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            ttsAudioCtxRef.current = ctx;

            const samples = new Uint8Array(analyser.frequencyBinCount);
            let smoothed = 0;
            const updateLevel = () => {
              if (!audioElRef.current || audioElRef.current.paused || audioElRef.current.ended) {
                return;
              }
              analyser.getByteTimeDomainData(samples);
              let sumSq = 0;
              for (let i = 0; i < samples.length; i++) {
                const v = (samples[i] - 128) / 128;
                sumSq += v * v;
              }
              const rms = Math.min(1, Math.sqrt(sumSq / samples.length) * 3.4);
              smoothed = smoothed * 0.8 + rms * 0.2;
              setSpeechLevel(smoothed);
              if (Number.isFinite(audio.duration) && audio.duration > 0) {
                setSpeechProgress(Math.min(1, audio.currentTime / audio.duration));
              }
              ttsRafRef.current = window.requestAnimationFrame(updateLevel);
            };
            audio.onplay = () => {
              setSpeechMode("audio");
              if (ctx.state === "suspended") ctx.resume().catch(() => { });
              ttsRafRef.current = window.requestAnimationFrame(updateLevel);
            };
            attachedAnalyser = true;
          } catch {
            // Fall back to CSS cadence animation if Web Audio attach fails
          }
        }
        if (!attachedAnalyser) {
          audio.onplay = () => setSpeechMode("audio");
        }

        audio.onended = () => {
          stopTtsMeter();
          setIsSpeaking(false);
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
          audioElRef.current = null;
          onEnd?.();
        };
        audio.onerror = () => {
          stopTtsMeter();
          setIsSpeaking(false);
          onEnd?.();
        };

        await audio.play();
      } catch {
        stopTtsMeter();
        // Fallback to browser TTS if ElevenLabs TTS fails or browser blocks autoplay
        speakWithBrowserFallback(text, onEnd);
      }
    },
    [persona, stopSpeaking, stopTtsMeter, speakWithBrowserFallback]
  );

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stopListening, stopSpeaking]);

  return {
    isListening,
    isTranscribing,
    isSpeaking,
    speechMode,
    speechLevel,
    speechProgress,
    muted,
    setMuted,
    speechRate,
    setSpeechRate,
    transcript,
    interimTranscript,
    micError,
    sttSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
    updateTranscript,
  };
}
