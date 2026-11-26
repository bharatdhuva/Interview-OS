const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function getDefaultModel() {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

function toGeminiContents(messages) {
  return (messages || []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

async function generate({
  model = getDefaultModel(),
  system,
  messages,
  temperature = 0.2,
  maxTokens = 2048,
  jsonMode = false,
  timeoutMs = 30000,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: toGeminiContents(messages),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const err = new Error(`Gemini API error (${res.status}): ${errText.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return {
    provider: "gemini",
    model,
    text,
    usage: {
      inputTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}

async function* stream({
  model = getDefaultModel(),
  system,
  messages,
  temperature = 0.2,
  maxTokens = 2048,
  timeoutMs = 30000,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: toGeminiContents(messages),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini stream error (${res.status}): ${errText.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (delta) {
          yield { delta, done: false };
        }
        if (parsed.usageMetadata) {
          yield {
            delta: "",
            done: false,
            usage: {
              inputTokens: parsed.usageMetadata.promptTokenCount || 0,
              outputTokens: parsed.usageMetadata.candidatesTokenCount || 0,
            },
          };
        }
      } catch {
        // ignore partial SSE chunks
      }
    }
  }

  yield { delta: "", done: true };
}

module.exports = {
  name: "gemini",
  isConfigured,
  getDefaultModel,
  generate,
  stream,
};
