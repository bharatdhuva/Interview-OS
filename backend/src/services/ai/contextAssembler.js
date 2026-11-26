const { summarizeWhiteboard, formatReplayTimeline } = require("./compression");

/**
 * Assembles all session signals into a normalized context object for AI evaluation.
 */
function assembleEvaluationContext({
  room,
  session,
  codeSnapshots = [],
  replayFrames = [],
  chatMessages = [],
  violations = [],
  transcriptSegments = [],
}) {
  const startTimeMs = session?.startTime
    ? new Date(session.startTime).getTime()
    : replayFrames[0]?.timestamp || Date.now();
  const endTimeMs = session?.endTime
    ? new Date(session.endTime).getTime()
    : replayFrames[replayFrames.length - 1]?.timestamp || startTimeMs + 1000;

  const sessionDurationMs = Math.max(1000, endTimeMs - startTimeMs);

  // Extract latest code from session.finalCode, last codeSnapshot, or last code replayFrame
  let finalCode = session?.finalCode || "";
  let finalLanguage = session?.finalLanguage || "javascript";

  if (!finalCode && codeSnapshots.length > 0) {
    const lastSnap = codeSnapshots[codeSnapshots.length - 1];
    finalCode = lastSnap.code || "";
    finalLanguage = lastSnap.language || finalLanguage;
  }

  if (!finalCode) {
    const codeFrames = replayFrames.filter((f) => f.type === "code" && f.payload?.code);
    if (codeFrames.length > 0) {
      const lastFrame = codeFrames[codeFrames.length - 1];
      finalCode = lastFrame.payload.code;
      finalLanguage = lastFrame.payload.language || finalLanguage;
    }
  }

  const runs = codeSnapshots
    .filter((s) => s.executionResult && (s.executionResult.stdout != null || s.executionResult.stderr != null))
    .map((s) => ({
      offsetMs: Math.max(0, Math.min(sessionDurationMs, new Date(s.savedAt || s.createdAt).getTime() - startTimeMs)),
      language: s.language,
      stdout: s.executionResult.stdout || "",
      stderr: s.executionResult.stderr || "",
      time: s.executionResult.time || null,
      memory: s.executionResult.memory || null,
    }));

  const chat = chatMessages.map((m) => ({
    offsetMs: Math.max(0, Math.min(sessionDurationMs, new Date(m.timestamp || m.createdAt).getTime() - startTimeMs)),
    userName: m.sender?.name || "Participant",
    message: m.message || "",
  }));

  const normalizedViolations = violations.map((v) => ({
    offsetMs: Math.max(0, Math.min(sessionDurationMs, new Date(v.timestamp || v.createdAt).getTime() - startTimeMs)),
    type: v.type,
    strikeCount: v.strikeCount || 1,
  }));

  const whiteboardSummary = summarizeWhiteboard(session?.whiteboardSnapshot);
  const timeline = formatReplayTimeline(replayFrames, startTimeMs);

  const missingSignals = [];
  if (!transcriptSegments || transcriptSegments.length === 0) {
    missingSignals.push("No audio/speech transcript available");
  }
  if (!finalCode || !finalCode.trim()) {
    missingSignals.push("No candidate code recorded");
  }
  if (runs.length === 0) {
    missingSignals.push("No Judge0 code execution runs recorded");
  }
  if (!session?.whiteboardSnapshot) {
    missingSignals.push("No whiteboard activity recorded");
  }

  return {
    roomTitle: room?.title,
    difficultyLevel: room?.difficultyLevel,
    techStack: room?.techStack || [],
    problemStatement: room?.problemStatement || "",
    sessionStartMs: startTimeMs,
    sessionEndMs: endTimeMs,
    sessionDurationMs,
    finalLanguage,
    finalCode,
    runs,
    timeline,
    whiteboardSummary,
    chat,
    violations: normalizedViolations,
    transcript: transcriptSegments,
    missingSignals,
  };
}

module.exports = {
  assembleEvaluationContext,
};
