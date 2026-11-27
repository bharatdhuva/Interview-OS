const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

// Pre-made ElevenLabs voices
const VOICE_IDS = {
  technical: "TX3LPaxmHKxFdv7VOQHJ", // Liam — calm, clear male voice
  hr: "EXAVITQu4vr4xnSDxMaL", // Sarah — warm, natural female voice
};

function isElevenLabsConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

async function synthesizeSpeech({ text, persona = "technical", speed = 1.0 }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    const err = new Error("ELEVENLABS_API_KEY is not configured");
    err.status = 503;
    throw err;
  }

  const voiceId = VOICE_IDS[persona] || VOICE_IDS.technical;
  const clampedSpeed = Math.min(1.2, Math.max(0.7, Number(speed) || 1.0));

  const res = await fetch(
    `${ELEVENLABS_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: String(text || "").slice(0, 2500),
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: clampedSpeed,
        },
      }),
      signal: AbortSignal.timeout(25000),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const err = new Error(`ElevenLabs TTS error (${res.status}): ${errText.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function transcribeAudio({ buffer, mimetype = "audio/webm", originalname = "recording.webm" }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    const err = new Error("ELEVENLABS_API_KEY is not configured");
    err.status = 503;
    throw err;
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: mimetype });
  form.append("file", blob, originalname);
  form.append("model_id", "scribe_v1");

  const res = await fetch(`${ELEVENLABS_BASE}/speech-to-text`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: form,
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const err = new Error(`ElevenLabs STT error (${res.status}): ${errText.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return {
    text: (data.text || "").trim(),
    languageCode: data.language_code || "en",
  };
}

module.exports = {
  isElevenLabsConfigured,
  synthesizeSpeech,
  transcribeAudio,
};
