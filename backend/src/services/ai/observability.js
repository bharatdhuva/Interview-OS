const logger = require("../../utils/logger");
const { AiCallLog } = require("../../models/aiCallLog.model");

/**
 * Per-model pricing table in USD per 1,000,000 tokens.
 * Values are approximate list prices for cost observability.
 */
const MODEL_PRICING_USD_PER_1M = {
  // Groq
  "llama-3.3-70b-versatile": { input: 0.59, output: 0.79 },
  "llama-3.1-8b-instant": { input: 0.05, output: 0.08 },
  "mixtral-8x7b-32768": { input: 0.24, output: 0.24 },
  // OpenAI
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  // Gemini
  "gemini-3.8-flash": { input: 0.15, output: 0.6 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-2.5-flash": { input: 0.15, output: 0.6 },
  "gemini-2.5-pro": { input: 1.25, output: 10.0 },
};

/**
 * Estimates USD cost for a single LLM call.
 */
function estimateCostUsd(model, inputTokens = 0, outputTokens = 0) {
  const pricing = MODEL_PRICING_USD_PER_1M[model];
  if (!pricing) return 0;
  const cost =
    (Math.max(0, inputTokens) / 1_000_000) * pricing.input +
    (Math.max(0, outputTokens) / 1_000_000) * pricing.output;
  return Number(cost.toFixed(6));
}

/**
 * Logs an AI call to Winston and persists an AiCallLog document.
 */
async function recordAiCall(entry) {
  const estimatedCostUsd =
    entry.estimatedCostUsd ??
    estimateCostUsd(entry.model, entry.inputTokens, entry.outputTokens);

  const logPayload = {
    provider: entry.provider || "unknown",
    model: entry.model || "unknown",
    promptName: entry.promptName || "ad_hoc",
    promptVersion: entry.promptVersion || "v0",
    inputTokens: entry.inputTokens || 0,
    outputTokens: entry.outputTokens || 0,
    estimatedCostUsd,
    totalLatencyMs: Math.max(0, Math.round(entry.totalLatencyMs || 0)),
    ttftMs: entry.ttftMs != null ? Math.max(0, Math.round(entry.ttftMs)) : null,
    outcome: entry.outcome || "success",
    errorMessage: entry.errorMessage,
    roomId: entry.roomId,
    sessionId: entry.sessionId,
    userId: entry.userId,
  };

  if (logPayload.outcome === "failed") {
    logger.warn("AI call failed", logPayload);
  } else {
    logger.info("AI call completed", logPayload);
  }

  try {
    await AiCallLog.create(logPayload);
  } catch (err) {
    logger.error("Failed to persist AiCallLog", { error: err.message });
  }

  return logPayload;
}

module.exports = {
  MODEL_PRICING_USD_PER_1M,
  estimateCostUsd,
  recordAiCall,
};
