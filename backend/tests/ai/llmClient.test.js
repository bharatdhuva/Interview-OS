import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";

const { AiCallLog } = require("../../src/models/aiCallLog.model");
const llmClient = require("../../src/services/ai/llmClient");
const { estimateCostUsd } = require("../../src/services/ai/observability");

const sampleSchema = z.object({
  score: z.number().int().min(1).max(5),
  reason: z.string().min(1),
});

describe("llmClient", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.AI_FALLBACK_PROVIDER = "gemini";
    vi.spyOn(AiCallLog, "create").mockResolvedValue({});
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.restoreAllMocks();
  });

  it("extracts JSON from markdown code fences", () => {
    const raw = "Here is the output:\n```json\n{\"score\": 4, \"reason\": \"clean\"}\n```";
    expect(llmClient.extractJsonString(raw)).toBe('{"score": 4, "reason": "clean"}');
  });

  it("estimates cost accurately from pricing table", () => {
    const cost = estimateCostUsd("gpt-4o-mini", 1_000_000, 1_000_000);
    expect(cost).toBe(0.75);
    expect(estimateCostUsd("unknown-model", 1000, 1000)).toBe(0);
  });

  it("returns validated structured output on first try", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          model: "llama-3.3-70b-versatile",
          choices: [{ message: { content: JSON.stringify({ score: 5, reason: "Optimal O(n)" }) } }],
          usage: { prompt_tokens: 100, completion_tokens: 25 },
        }),
      })
    );

    const res = await llmClient.generateStructured(sampleSchema, {
      messages: [{ role: "user", content: "Evaluate" }],
      promptName: "test",
      promptVersion: "v1",
    });

    expect(res.data).toEqual({ score: 5, reason: "Optimal O(n)" });
    expect(res.outcome).toBe("success");
    expect(res.provider).toBe("groq");
    expect(AiCallLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "success", promptName: "test", promptVersion: "v1" })
    );
  });

  it("retries with repair hint when first response fails Zod validation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: "llama-3.3-70b-versatile",
          choices: [{ message: { content: JSON.stringify({ score: 99, reason: "Out of range" }) } }],
          usage: { prompt_tokens: 50, completion_tokens: 10 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: "llama-3.3-70b-versatile",
          choices: [{ message: { content: JSON.stringify({ score: 4, reason: "Repaired" }) } }],
          usage: { prompt_tokens: 80, completion_tokens: 15 },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const res = await llmClient.generateStructured(sampleSchema, {
      messages: [{ role: "user", content: "Evaluate" }],
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.data.score).toBe(4);
    expect(res.outcome).toBe("retried");
    expect(res.usage.inputTokens).toBe(130);
  });

  it("falls back to secondary provider when primary fails", async () => {
    const fetchMock = vi.fn().mockImplementation((url) => {
      if (String(url).includes("groq.com")) {
        return Promise.resolve({
          ok: false,
          status: 503,
          text: async () => "Service unavailable",
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          candidates: [
            { content: { parts: [{ text: JSON.stringify({ score: 3, reason: "Gemini fallback" }) }] } },
          ],
          usageMetadata: { promptTokenCount: 40, candidatesTokenCount: 12 },
        }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await llmClient.generateStructured(sampleSchema, {
      messages: [{ role: "user", content: "Evaluate" }],
    });

    expect(res.provider).toBe("gemini");
    expect(res.outcome).toBe("fallback");
    expect(res.data.reason).toBe("Gemini fallback");
  });
});
