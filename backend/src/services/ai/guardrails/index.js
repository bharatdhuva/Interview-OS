/**
 * Neutralizes closing-tag lookalikes inside untrusted candidate text
 * so candidate content cannot break out of XML delimiter tags.
 */
function sanitizeUntrustedTagContent(text, tagName) {
  if (text == null) return "";
  const str = String(text);
  const closeTagRegex = new RegExp(`<\\s*/\\s*${tagName}\\s*>`, "gi");
  const openTagRegex = new RegExp(`<\\s*${tagName}\\s*>`, "gi");
  return str
    .replace(closeTagRegex, `[escaped_/${tagName}]`)
    .replace(openTagRegex, `[escaped_${tagName}]`);
}

function wrapUntrusted(tagName, text) {
  const safe = sanitizeUntrustedTagContent(text, tagName);
  return `<${tagName}>\n${safe}\n</${tagName}>`;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|system)\s+(instructions|prompt)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /rate\s+(this|me|candidate)\s+(10\/10|5\/5|perfect|strong_yes)/i,
  /override\s+(system|rubric|score)/i,
  /system\s*:\s*you\s+must/i,
];

/**
 * Scans untrusted items ({ source, offsetMs, text }) for common prompt-injection phrases.
 */
function detectInjectionAttempts(items = []) {
  const flags = [];
  for (const item of items) {
    const text = String(item?.text || "");
    if (!text) continue;
    for (const pattern of INJECTION_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        flags.push({
          source: item.source || "unknown",
          offsetMs: item.offsetMs ?? 0,
          matchedPattern: match[0].slice(0, 120),
        });
        break;
      }
    }
  }
  return flags;
}

/**
 * Checks whether LLM output contains sensitive secrets or system-prompt fragments.
 */
function checkOutputForLeaks(outputText, systemPrompt = "") {
  const text = typeof outputText === "string" ? outputText : JSON.stringify(outputText || {});
  const leakReasons = [];

  if (/(GROQ_API_KEY|OPENAI_API_KEY|GEMINI_API_KEY|JWT_ACCESS_SECRET|MONGODB_URI)/i.test(text)) {
    leakReasons.push("Contains environment variable name");
  }
  if (/CRITICAL SECURITY RULE:/i.test(text) || (systemPrompt && text.includes(systemPrompt.slice(0, 60)))) {
    leakReasons.push("Contains system prompt fragment");
  }

  return {
    clean: leakReasons.length === 0,
    reasons: leakReasons,
  };
}

/**
 * Post-validation anomaly checks on AI evaluation output.
 */
function checkEvaluationAnomalies(evaluation, context) {
  const anomalies = [];
  const runs = context?.runs || [];
  const allRunsFailed =
    runs.length > 0 && runs.every((r) => Boolean(r.stderr && r.stderr.trim().length > 0));

  const scores = Object.values(evaluation?.rubricScores || {}).map((d) => d.score);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  if (allRunsFailed && avgScore >= 4.5) {
    anomalies.push("High rubric scores despite all code execution runs failing");
  }
  if ((context?.violations || []).length >= 3 && ["yes", "strong_yes"].includes(evaluation?.recommendation)) {
    anomalies.push("Positive recommendation despite 3+ proctoring violations");
  }

  return {
    needsHumanReview: anomalies.length > 0,
    anomalies,
  };
}

module.exports = {
  sanitizeUntrustedTagContent,
  wrapUntrusted,
  detectInjectionAttempts,
  checkOutputForLeaks,
  checkEvaluationAnomalies,
};
