const pdfParse = require("pdf-parse");
const llmClient = require("./llmClient");
const { wrapUntrusted, sanitizeUntrustedTagContent, checkOutputForLeaks } = require("./guardrails");
const {
  interviewerTurnSchema,
  aiInterviewEvaluationSchema,
  buildInterviewerSystemPrompt,
  buildEvaluationSystemPrompt,
} = require("./prompts/interviewer.v1");

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
  "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "FastAPI", "Django", "Flask",
  "Spring Boot", "GraphQL", "REST", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Kafka",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "CI/CD", "Git",
  "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "LLMs", "RAG", "LangChain",
  "System Design", "Microservices", "HTML", "CSS", "Tailwind", "SQL", "Linux",
];

function getProviderStatus() {
  const providerNames = ["groq", "gemini", "openai"];
  const configuredProviders = providerNames.filter((name) => {
    try {
      return llmClient.getProvider(name).isConfigured();
    } catch {
      return false;
    }
  });
  const preferred = (process.env.AI_PROVIDER || "groq").toLowerCase();
  const activeProvider = configuredProviders.includes(preferred)
    ? preferred
    : configuredProviders[0] || null;

  return {
    configured: configuredProviders.length > 0,
    activeProvider,
    configuredProviders,
  };
}

function ensureAiConfigured() {
  const status = getProviderStatus();
  if (!status.configured) {
    const err = new Error(
      "No AI provider API key is configured on the server. Add GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in backend/.env to start live AI voice interviews."
    );
    err.status = 503;
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }
  return status.activeProvider;
}

function extractSkillsFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const skill of COMMON_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z0-9])${escaped.toLowerCase()}([^a-z0-9]|$)`);
    if (pattern.test(lower)) {
      found.push(skill);
    }
  }
  return found.slice(0, 20);
}

async function extractResumeData({ buffer, mimetype, originalname, rawText }) {
  let text = "";

  if (buffer && buffer.length > 0) {
    const isPdf =
      mimetype === "application/pdf" ||
      (originalname && originalname.toLowerCase().endsWith(".pdf"));

    if (isPdf) {
      if (typeof pdfParse === "function") {
        const parsed = await pdfParse(buffer);
        text = parsed.text || "";
      } else if (typeof pdfParse?.PDFParse === "function") {
        const parser = new pdfParse.PDFParse({ data: buffer });
        try {
          const parsed = await parser.getText();
          text = parsed?.text || "";
        } finally {
          await parser.destroy().catch(() => {});
        }
      } else {
        throw new Error("PDF parser is not available");
      }
    } else {
      text = buffer.toString("utf8");
    }
  } else if (rawText) {
    text = String(rawText);
  }

  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 12000);

  const sanitized = sanitizeUntrustedTagContent(normalized, "resume");
  const parsedSkills = extractSkillsFromText(sanitized);

  return {
    fileName: originalname || (rawText ? "pasted-resume.txt" : "resume"),
    rawText: sanitized,
    parsedSkills,
    charCount: sanitized.length,
  };
}

function formatConversationHistory(messages = []) {
  return messages.map((m) => ({
    role: m.role === "interviewer" ? "assistant" : "user",
    content:
      m.role === "candidate"
        ? wrapUntrusted("candidate_answer", m.content)
        : m.content,
  }));
}

async function generateOpeningTurn(session, candidateName) {
  const provider = ensureAiConfigured();
  const system = buildInterviewerSystemPrompt({
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    targetRole: session.targetRole,
    focusArea: session.focusArea,
    totalQuestions: session.totalQuestions,
    currentQuestionIndex: 0,
    resumeText: session.resume?.rawText,
    parsedSkills: session.resume?.parsedSkills,
    candidateName,
  });

  const userPrompt =
    "Begin the interview now. Greet the candidate warmly by name (1 short sentence), briefly reference one relevant highlight from their resume, and ask your first question.";

  const model = llmClient.getProvider(provider).getDefaultModel();
  const result = await llmClient.generateStructured(interviewerTurnSchema, {
    provider,
    model,
    system,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.4,
    maxTokens: 1500,
    promptName: "ai_interviewer_open",
    promptVersion: "v1",
    meta: { sessionId: session.sessionId, userId: String(session.user) },
  });

  const leakCheck = checkOutputForLeaks(result.data.reply, system);
  if (!leakCheck.clean) {
    result.data.reply =
      "Hello! Thanks for joining today. Let's start with a quick walkthrough of the most impactful project on your resume and your role in it.";
  }

  return result.data;
}

async function generateNextTurn(session, candidateAnswer, candidateName) {
  const provider = ensureAiConfigured();
  const nextIndex = session.currentQuestionIndex + 1;
  const isFinalTurn = nextIndex >= session.totalQuestions;

  const system = buildInterviewerSystemPrompt({
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    targetRole: session.targetRole,
    focusArea: session.focusArea,
    totalQuestions: session.totalQuestions,
    currentQuestionIndex: nextIndex,
    resumeText: session.resume?.rawText,
    parsedSkills: session.resume?.parsedSkills,
    candidateName,
  });

  const history = formatConversationHistory(session.messages);
  const instruction = isFinalTurn
    ? "The candidate just answered the final question. Acknowledge their answer briefly, thank them for their time, and wrap up the interview naturally. Set shouldEnd to true."
    : "Acknowledge the candidate's answer briefly and ask the next natural question or a focused follow-up.";

  const messages = [
    ...history,
    {
      role: "user",
      content: `${wrapUntrusted("candidate_answer", candidateAnswer)}\n\n[Interviewer instruction: ${instruction}]`,
    },
  ];

  const model = llmClient.getProvider(provider).getDefaultModel();
  const result = await llmClient.generateStructured(interviewerTurnSchema, {
    provider,
    model,
    system,
    messages,
    temperature: 0.4,
    maxTokens: 1500,
    promptName: "ai_interviewer_turn",
    promptVersion: "v1",
    meta: { sessionId: session.sessionId, userId: String(session.user) },
  });

  const leakCheck = checkOutputForLeaks(result.data.reply, system);
  if (!leakCheck.clean) {
    result.data.reply = isFinalTurn
      ? "Thank you for sharing that. That wraps up our interview today—I'll now prepare your feedback report."
      : "Thank you for explaining that. Could you walk me through a challenging trade-off you had to make in a recent project?";
  }

  if (isFinalTurn) {
    result.data.shouldEnd = true;
  }

  return result.data;
}

async function generateSessionEvaluation(session) {
  const provider = ensureAiConfigured();
  const system = buildEvaluationSystemPrompt({
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    targetRole: session.targetRole,
  });

  const transcriptText = (session.messages || [])
    .map((m, idx) => {
      const label = m.role === "interviewer" ? "INTERVIEWER" : "CANDIDATE";
      const content =
        m.role === "candidate"
          ? wrapUntrusted("candidate_answer", m.content)
          : m.content;
      return `[${idx + 1}] ${label}: ${content}`;
    })
    .join("\n\n");

  const userContent = `RESUME CONTEXT:\n${wrapUntrusted(
    "resume",
    (session.resume?.rawText || "No resume provided.").slice(0, 3500)
  )}\n\nINTERVIEW TRANSCRIPT:\n${transcriptText || "No transcript recorded."}`;

  const model = llmClient.getProvider(provider).getDefaultModel();
  const result = await llmClient.generateStructured(aiInterviewEvaluationSchema, {
    provider,
    model,
    system,
    messages: [{ role: "user", content: userContent }],
    temperature: 0.15,
    maxTokens: 1800,
    promptName: "ai_interviewer_eval",
    promptVersion: "v1",
    meta: { sessionId: session.sessionId, userId: String(session.user) },
  });

  return result.data;
}

module.exports = {
  getProviderStatus,
  extractResumeData,
  generateOpeningTurn,
  generateNextTurn,
  generateSessionEvaluation,
};
