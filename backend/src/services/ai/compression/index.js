/**
 * Extracts a compact human-readable summary from an Excalidraw snapshot.
 */
function summarizeWhiteboard(whiteboardSnapshot) {
  if (!whiteboardSnapshot) return "No whiteboard activity.";
  const elements = Array.isArray(whiteboardSnapshot)
    ? whiteboardSnapshot
    : whiteboardSnapshot.elements;

  if (!Array.isArray(elements) || elements.length === 0) {
    return "Whiteboard is empty.";
  }

  const active = elements.filter((el) => el && !el.isDeleted);
  if (active.length === 0) return "Whiteboard is empty.";

  const typeCounts = {};
  const labels = [];

  for (const el of active) {
    const t = el.type || "unknown";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
    if (el.type === "text" && typeof el.text === "string" && el.text.trim()) {
      labels.push(el.text.trim().slice(0, 120));
    }
  }

  const countsStr = Object.entries(typeCounts)
    .map(([k, v]) => `${k}:${v}`)
    .join(", ");
  const labelsStr = labels.length ? `Labels: ${labels.slice(0, 30).join(" | ")}` : "No text labels.";
  return `Elements (${active.length}): ${countsStr}. ${labelsStr}`;
}

/**
 * Formats ReplayFrame records into a compact timeline with offsetMs from sessionStartMs.
 */
function formatReplayTimeline(frames = [], sessionStartMs = 0, maxItems = 40) {
  if (!Array.isArray(frames) || frames.length === 0) return [];
  const step = frames.length > maxItems ? Math.ceil(frames.length / maxItems) : 1;
  const result = [];

  for (let i = 0; i < frames.length; i += step) {
    const f = frames[i];
    const offsetMs = Math.max(0, (Number(f.timestamp) || sessionStartMs) - sessionStartMs);
    let summary = f.type;

    if (f.type === "code") {
      const len = typeof f.payload?.code === "string" ? f.payload.code.length : 0;
      summary = `Code snapshot (${f.payload?.language || "unknown"}, ${len} chars)`;
    } else if (f.type === "execution") {
      const hasErr = Boolean(f.payload?.executionResult?.stderr);
      summary = `Code execution (${hasErr ? "stderr" : "stdout"})`;
    } else if (f.type === "chat") {
      summary = `${f.payload?.userName || "Participant"}: ${String(f.payload?.message || "").slice(0, 100)}`;
    } else if (f.type === "violation") {
      summary = f.payload?.reason || f.payload?.violationType || "Proctor violation";
    } else if (f.type === "whiteboard") {
      summary = "Whiteboard snapshot";
    }

    result.push({ offsetMs, type: f.type, summary });
  }

  return result;
}

module.exports = {
  summarizeWhiteboard,
  formatReplayTimeline,
};
