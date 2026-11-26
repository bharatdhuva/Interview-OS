const { z } = require("zod");

const evidenceSchema = z.object({
  replayTimestampMs: z.number().min(0),
  source: z.enum(["code", "run", "chat", "whiteboard", "transcript", "violation"]),
  quoteOrSummary: z.string().min(1).max(500),
});

const rubricDimensionSchema = z.object({
  score: z.number().int().min(1).max(5),
  rationale: z.string().min(1).max(800),
  evidence: z.array(evidenceSchema).default([]),
});

const aiEvaluationOutputSchema = z.object({
  rubricScores: z.object({
    problemSolving: rubricDimensionSchema,
    codeQuality: rubricDimensionSchema,
    timeSpaceComplexity: rubricDimensionSchema,
    communication: rubricDimensionSchema,
    edgeCaseHandling: rubricDimensionSchema,
    testingDebugging: rubricDimensionSchema,
  }),
  strengths: z.array(z.string().min(1)).min(1),
  improvements: z.array(z.string().min(1)).min(1),
  summary: z.string().min(10).max(2000),
  recommendation: z.enum([
    "strong_no",
    "no",
    "lean_no",
    "lean_yes",
    "yes",
    "strong_yes",
  ]),
  confidence: z.enum(["low", "medium", "high"]),
  missingSignals: z.array(z.string()).default([]),
  insufficientEvidence: z.boolean().default(false),
});

/**
 * Validates that all evidence replayTimestampMs values fall within [0, maxDurationMs].
 * Returns { valid, invalidTimestamps }.
 */
function validateEvidenceTimestamps(evaluation, maxDurationMs) {
  const invalidTimestamps = [];
  const limit = Math.max(1000, Number(maxDurationMs) || 1000);
  const scores = evaluation?.rubricScores || {};

  for (const [dimension, dimData] of Object.entries(scores)) {
    for (const item of dimData?.evidence || []) {
      if (
        typeof item.replayTimestampMs !== "number" ||
        !Number.isFinite(item.replayTimestampMs) ||
        item.replayTimestampMs < 0 ||
        item.replayTimestampMs > limit
      ) {
        invalidTimestamps.push({
          dimension,
          replayTimestampMs: item.replayTimestampMs,
          maxDurationMs: limit,
        });
      }
    }
  }

  return {
    valid: invalidTimestamps.length === 0,
    invalidTimestamps,
  };
}

module.exports = {
  evidenceSchema,
  rubricDimensionSchema,
  aiEvaluationOutputSchema,
  validateEvidenceTimestamps,
};
