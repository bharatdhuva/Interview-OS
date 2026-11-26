const { CodeSnapshot } = require("../../models/codeSnapshot.model");
const { ReplayFrame } = require("../../models/replayFrame.model");
const { ChatMessage } = require("../../models/chatMessage.model");
const { Violation } = require("../../models/violation.model");
const { AiEvaluation } = require("../../models/aiEvaluation.model");
const { assembleEvaluationContext } = require("./contextAssembler");
const {
  aiEvaluationOutputSchema,
  validateEvidenceTimestamps,
} = require("./schemas/evaluation.schema");
const evaluationPromptV1 = require("./prompts/evaluation.v1");
const llmClient = require("./llmClient");
const { estimateCostUsd } = require("./observability");
const {
  detectInjectionAttempts,
  checkOutputForLeaks,
  checkEvaluationAnomalies,
} = require("./guardrails");

/**
 * Runs the post-interview AI evaluation pipeline and updates the AiEvaluation document.
 */
async function runEvaluationPipeline({ evaluationId, room, session, userId }) {
  try {
    const [codeSnapshots, replayFrames, chatMessages, violations] = await Promise.all([
      CodeSnapshot.find({ room: room._id, session: session._id }).sort({ savedAt: 1 }).lean(),
      ReplayFrame.find({ roomId: room.roomId }).sort({ timestamp: 1 }).lean(),
      ChatMessage.find({ room: room._id, isDeleted: { $ne: true } })
        .populate("sender", "name")
        .sort({ timestamp: 1 })
        .lean(),
      Violation.find({ roomId: room.roomId }).sort({ timestamp: 1 }).lean(),
    ]);

    const context = assembleEvaluationContext({
      room,
      session,
      codeSnapshots,
      replayFrames,
      chatMessages,
      violations,
    });

    const injectionFlags = detectInjectionAttempts([
      { source: "code", offsetMs: context.sessionDurationMs, text: context.finalCode },
      { source: "whiteboard", offsetMs: 0, text: context.whiteboardSummary },
      ...context.chat.map((c) => ({
        source: "chat",
        offsetMs: c.offsetMs,
        text: c.message,
      })),
    ]);

    const userMessage = evaluationPromptV1.buildUserMessage(context);

    const llmResult = await llmClient.generateStructured(aiEvaluationOutputSchema, {
      system: evaluationPromptV1.system,
      messages: [{ role: "user", content: userMessage }],
      promptName: evaluationPromptV1.name,
      promptVersion: evaluationPromptV1.version,
      meta: {
        roomId: room.roomId,
        sessionId: session._id,
        userId,
      },
    });

    const leakCheck = checkOutputForLeaks(llmResult.data, evaluationPromptV1.system);
    if (!leakCheck.clean) {
      throw new Error(`Output blocked by leak guardrail: ${leakCheck.reasons.join(", ")}`);
    }

    const tsCheck = validateEvidenceTimestamps(llmResult.data, context.sessionDurationMs);
    const anomalyCheck = checkEvaluationAnomalies(llmResult.data, context);

    const anomalies = [...anomalyCheck.anomalies];
    if (!tsCheck.valid) {
      anomalies.push(
        `Out-of-range evidence timestamps detected (${tsCheck.invalidTimestamps.length})`
      );
      // Clamp out-of-range timestamps so UI links stay within session bounds
      for (const dim of Object.values(llmResult.data.rubricScores)) {
        for (const ev of dim.evidence || []) {
          ev.replayTimestampMs = Math.max(
            0,
            Math.min(context.sessionDurationMs, ev.replayTimestampMs)
          );
        }
      }
    }

    const cost = estimateCostUsd(
      llmResult.model,
      llmResult.usage.inputTokens,
      llmResult.usage.outputTokens
    );

    const updated = await AiEvaluation.findByIdAndUpdate(
      evaluationId,
      {
        status: "ready",
        promptName: evaluationPromptV1.name,
        promptVersion: evaluationPromptV1.version,
        provider: llmResult.provider,
        model: llmResult.model,
        rubricScores: llmResult.data.rubricScores,
        summary: llmResult.data.summary,
        strengths: llmResult.data.strengths,
        improvements: llmResult.data.improvements,
        recommendation: llmResult.data.recommendation,
        confidence: llmResult.data.confidence,
        missingSignals: llmResult.data.missingSignals,
        insufficientEvidence: llmResult.data.insufficientEvidence,
        injectionSuspected: injectionFlags.length > 0,
        injectionFlags,
        needsHumanReview:
          anomalyCheck.needsHumanReview || !tsCheck.valid || injectionFlags.length > 0,
        anomalies,
        tokens: {
          input: llmResult.usage.inputTokens,
          output: llmResult.usage.outputTokens,
        },
        cost,
        latency: llmResult.latencyMs,
      },
      { new: true }
    );

    return updated;
  } catch (err) {
    await AiEvaluation.findByIdAndUpdate(evaluationId, {
      status: "failed",
      errorMessage: err.message,
    });
    throw err;
  }
}

module.exports = {
  runEvaluationPipeline,
};
