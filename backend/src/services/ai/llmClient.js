const groqProvider = require("./providers/groq");
const openaiProvider = require("./providers/openai");
const geminiProvider = require("./providers/gemini");
const { recordAiCall } = require("./observability");

const PROVIDERS = {
  groq: groqProvider,
  openai: openaiProvider,
  gemini: geminiProvider,
};

function getProvider(name) {
  const key = (name || process.env.AI_PROVIDER || "groq").toLowerCase();
  const provider = PROVIDERS[key];
  if (!provider) {
    throw new Error(`Unsupported AI provider: ${key}`);
  }
  return provider;
}

function getFallbackProvider(primaryName) {
  const fallbackName = (process.env.AI_FALLBACK_PROVIDER || "").toLowerCase();
  if (!fallbackName || fallbackName === primaryName) return null;
  const provider = PROVIDERS[fallbackName];
  if (!provider || !provider.isConfigured()) return null;
  return provider;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonString(rawText) {
  const trimmed = String(rawText || "").trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

async function callWithRetries(provider, params, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await provider.generate(params);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const backoffMs = 400 * Math.pow(2, attempt);
        await sleep(backoffMs);
      }
    }
  }
  throw lastError;
}

/**
 * Generates plain text with retry + fallback + observability logging.
 */
async function generate({
  provider: providerName,
  model,
  system,
  messages,
  temperature = 0.2,
  maxTokens = 2048,
  timeoutMs = 30000,
  promptName = "ad_hoc",
  promptVersion = "v1",
  meta = {},
}) {
  const primary = getProvider(providerName);
  const selectedModel = model || process.env.AI_MODEL || primary.getDefaultModel();
  const startedAt = Date.now();

  try {
    const res = await callWithRetries(primary, {
      model: selectedModel,
      system,
      messages,
      temperature,
      maxTokens,
      timeoutMs,
    });

    await recordAiCall({
      provider: res.provider,
      model: res.model,
      promptName,
      promptVersion,
      inputTokens: res.usage.inputTokens,
      outputTokens: res.usage.outputTokens,
      totalLatencyMs: Date.now() - startedAt,
      outcome: "success",
      ...meta,
    });

    return res;
  } catch (primaryErr) {
    const fallback = getFallbackProvider(primary.name);
    if (fallback) {
      try {
        const fbModel = fallback.getDefaultModel();
        const res = await callWithRetries(fallback, {
          model: fbModel,
          system,
          messages,
          temperature,
          maxTokens,
          timeoutMs,
        });
        await recordAiCall({
          provider: res.provider,
          model: res.model,
          promptName,
          promptVersion,
          inputTokens: res.usage.inputTokens,
          outputTokens: res.usage.outputTokens,
          totalLatencyMs: Date.now() - startedAt,
          outcome: "fallback",
          errorMessage: primaryErr.message,
          ...meta,
        });
        return res;
      } catch (fbErr) {
        await recordAiCall({
          provider: fallback.name,
          model: fallback.getDefaultModel(),
          promptName,
          promptVersion,
          totalLatencyMs: Date.now() - startedAt,
          outcome: "failed",
          errorMessage: fbErr.message,
          ...meta,
        });
        throw fbErr;
      }
    }

    await recordAiCall({
      provider: primary.name,
      model: selectedModel,
      promptName,
      promptVersion,
      totalLatencyMs: Date.now() - startedAt,
      outcome: "failed",
      errorMessage: primaryErr.message,
      ...meta,
    });
    throw primaryErr;
  }
}

/**
 * Generates JSON validated against a Zod schema.
 * Retries once with the Zod validation error as a repair hint, then falls back.
 */
async function generateStructured(
  schema,
  {
    provider: providerName,
    model,
    system,
    messages,
    temperature = 0.1,
    maxTokens = 2500,
    timeoutMs = 35000,
    promptName = "structured",
    promptVersion = "v1",
    meta = {},
  }
) {
  const primary = getProvider(providerName);
  const selectedModel = model || process.env.AI_MODEL || primary.getDefaultModel();
  const startedAt = Date.now();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  async function tryProviderWithRepair(prov, provModel, isFallback) {
    const firstRes = await callWithRetries(prov, {
      model: provModel,
      system,
      messages,
      temperature,
      maxTokens,
      jsonMode: true,
      timeoutMs,
    });
    totalInputTokens += firstRes.usage.inputTokens;
    totalOutputTokens += firstRes.usage.outputTokens;

    const parsed1 = parseAndValidate(firstRes.text, schema);
    if (parsed1.success) {
      return {
        data: parsed1.data,
        rawText: firstRes.text,
        provider: firstRes.provider,
        model: firstRes.model,
        outcome: isFallback ? "fallback" : "success",
      };
    }

    // Repair attempt: append validation error as repair hint
    const repairMessages = [
      ...messages,
      { role: "assistant", content: firstRes.text },
      {
        role: "user",
        content: `Your previous JSON failed schema validation with error:\n${parsed1.error}\nReturn ONLY corrected valid JSON matching the schema.`,
      },
    ];

    const repairRes = await callWithRetries(prov, {
      model: provModel,
      system,
      messages: repairMessages,
      temperature,
      maxTokens,
      jsonMode: true,
      timeoutMs,
    });
    totalInputTokens += repairRes.usage.inputTokens;
    totalOutputTokens += repairRes.usage.outputTokens;

    const parsed2 = parseAndValidate(repairRes.text, schema);
    if (parsed2.success) {
      return {
        data: parsed2.data,
        rawText: repairRes.text,
        provider: repairRes.provider,
        model: repairRes.model,
        outcome: isFallback ? "fallback" : "retried",
      };
    }

    const err = new Error(`Structured output validation failed: ${parsed2.error}`);
    err.code = "SCHEMA_VALIDATION_FAILED";
    throw err;
  }

  try {
    const result = await tryProviderWithRepair(primary, selectedModel, false);
    await recordAiCall({
      provider: result.provider,
      model: result.model,
      promptName,
      promptVersion,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      totalLatencyMs: Date.now() - startedAt,
      outcome: result.outcome,
      ...meta,
    });
    return {
      ...result,
      usage: { inputTokens: totalInputTokens, outputTokens: totalOutputTokens },
      latencyMs: Date.now() - startedAt,
    };
  } catch (primaryErr) {
    const fallback = getFallbackProvider(primary.name);
    if (fallback) {
      try {
        const fbModel = fallback.getDefaultModel();
        const result = await tryProviderWithRepair(fallback, fbModel, true);
        await recordAiCall({
          provider: result.provider,
          model: result.model,
          promptName,
          promptVersion,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          totalLatencyMs: Date.now() - startedAt,
          outcome: "fallback",
          errorMessage: primaryErr.message,
          ...meta,
        });
        return {
          ...result,
          usage: { inputTokens: totalInputTokens, outputTokens: totalOutputTokens },
          latencyMs: Date.now() - startedAt,
        };
      } catch (fbErr) {
        await recordAiCall({
          provider: fallback.name,
          model: fallback.getDefaultModel(),
          promptName,
          promptVersion,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          totalLatencyMs: Date.now() - startedAt,
          outcome: "failed",
          errorMessage: fbErr.message,
          ...meta,
        });
        throw fbErr;
      }
    }

    await recordAiCall({
      provider: primary.name,
      model: selectedModel,
      promptName,
      promptVersion,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      totalLatencyMs: Date.now() - startedAt,
      outcome: "failed",
      errorMessage: primaryErr.message,
      ...meta,
    });
    throw primaryErr;
  }
}

function parseAndValidate(rawText, schema) {
  try {
    const jsonStr = extractJsonString(rawText);
    const obj = JSON.parse(jsonStr);
    const validation = schema.safeParse(obj);
    if (validation.success) {
      return { success: true, data: validation.data };
    }
    return {
      success: false,
      error: validation.error.issues
        .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
        .join("; "),
    };
  } catch (err) {
    return { success: false, error: `Invalid JSON: ${err.message}` };
  }
}

/**
 * Streams tokens as an async iterator and records TTFT + total latency.
 */
async function* stream({
  provider: providerName,
  model,
  system,
  messages,
  temperature = 0.2,
  maxTokens = 1500,
  timeoutMs = 30000,
  promptName = "stream",
  promptVersion = "v1",
  meta = {},
}) {
  const provider = getProvider(providerName);
  const selectedModel = model || process.env.AI_MODEL || provider.getDefaultModel();
  const startedAt = Date.now();
  let ttftMs = null;
  let usage = { inputTokens: 0, outputTokens: 0 };

  try {
    for await (const chunk of provider.stream({
      model: selectedModel,
      system,
      messages,
      temperature,
      maxTokens,
      timeoutMs,
    })) {
      if (chunk.delta && ttftMs === null) {
        ttftMs = Date.now() - startedAt;
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
      yield chunk;
    }

    await recordAiCall({
      provider: provider.name,
      model: selectedModel,
      promptName,
      promptVersion,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalLatencyMs: Date.now() - startedAt,
      ttftMs,
      outcome: "success",
      ...meta,
    });
  } catch (err) {
    await recordAiCall({
      provider: provider.name,
      model: selectedModel,
      promptName,
      promptVersion,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalLatencyMs: Date.now() - startedAt,
      ttftMs,
      outcome: "failed",
      errorMessage: err.message,
      ...meta,
    });
    throw err;
  }
}

module.exports = {
  generate,
  generateStructured,
  stream,
  getProvider,
  extractJsonString,
  parseAndValidate,
};
