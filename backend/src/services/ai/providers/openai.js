const OPENAI_BASE_URL = "https://api.openai.com/v1/chat/completions";

function isConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function getDefaultModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

function buildMessages(system, messages) {
  const result = [];
  if (system) {
    result.push({ role: "system", content: system });
  }
  for (const m of messages || []) {
    result.push({ role: m.role, content: m.content });
  }
  return result;
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const body = {
    model,
    messages: buildMessages(system, messages),
    temperature,
    max_tokens: maxTokens,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(OPENAI_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const err = new Error(`OpenAI API error (${res.status}): ${errText.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return {
    provider: "openai",
    model: data.model || model,
    text,
    usage: {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const res = await fetch(OPENAI_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(system, messages),
      temperature,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI stream error (${res.status}): ${errText.slice(0, 300)}`);
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
      if (payload === "[DONE]") {
        yield { delta: "", done: true };
        return;
      }
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content || "";
        if (delta) {
          yield { delta, done: false };
        }
        if (parsed.usage) {
          yield {
            delta: "",
            done: false,
            usage: {
              inputTokens: parsed.usage.prompt_tokens || 0,
              outputTokens: parsed.usage.completion_tokens || 0,
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
  name: "openai",
  isConfigured,
  getDefaultModel,
  generate,
  stream,
};
