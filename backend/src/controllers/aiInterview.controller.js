const crypto = require("crypto");
const { z } = require("zod");
const { AiInterviewSession } = require("../models/aiInterviewSession.model");
const aiInterviewerService = require("../services/ai/interviewer");
const voiceService = require("../services/ai/voice");

const createSessionSchema = z.object({
  interviewType: z.enum(["technical", "hr"]),
  difficulty: z.enum(["junior", "mid", "senior"]).default("mid"),
  targetRole: z.string().max(120).optional().default(""),
  focusArea: z.string().max(250).optional().default(""),
  totalQuestions: z.number().int().min(3).max(12).optional().default(6),
  resumeText: z.string().max(15000).optional().default(""),
  resumeFileName: z.string().max(200).optional().default(""),
  parsedSkills: z.array(z.string().max(50)).max(25).optional().default([]),
});

const turnSchema = z.object({
  answer: z.string().min(1, "Please provide an answer").max(6000),
  durationMs: z.number().int().min(0).optional().default(0),
});

exports.getStatus = async (_req, res) => {
  const status = aiInterviewerService.getProviderStatus();
  res.status(200).json({
    success: true,
    data: status,
  });
};

exports.parseResume = async (req, res, next) => {
  try {
    const file = req.file;
    const rawText = req.body?.resumeText || "";

    if (!file && !rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF/TXT/MD resume file or paste resume text.",
      });
    }

    const parsed = await aiInterviewerService.extractResumeData({
      buffer: file?.buffer,
      mimetype: file?.mimetype,
      originalname: file?.originalname,
      rawText,
    });

    if (!parsed.rawText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract readable text from the uploaded resume. Try pasting the text instead.",
      });
    }

    const validation = aiInterviewerService.validateResumeContent(parsed.rawText);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        code: "INVALID_RESUME",
        message: validation.reason,
      });
    }

    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (err) {
    next(err);
  }
};

exports.listSessions = async (req, res, next) => {
  try {
    const sessions = await AiInterviewSession.find({ user: req.user._id })
      .select("-resume.rawText -messages")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
    }

    const data = parsed.data;
    const resumeValidation = aiInterviewerService.validateResumeContent(data.resumeText);
    if (!resumeValidation.valid) {
      return res.status(400).json({
        success: false,
        code: "INVALID_RESUME",
        message: resumeValidation.reason,
      });
    }
    const sessionId = `ai-${crypto.randomUUID().slice(0, 8)}`;

    const session = await AiInterviewSession.create({
      sessionId,
      user: req.user._id,
      interviewType: data.interviewType,
      difficulty: data.difficulty,
      targetRole: data.targetRole.trim(),
      focusArea: data.focusArea.trim(),
      totalQuestions: data.totalQuestions,
      resume: {
        fileName: data.resumeFileName || "",
        rawText: data.resumeText.slice(0, 12000),
        parsedSkills: data.parsedSkills,
      },
      status: "setup",
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const session = await AiInterviewSession.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "AI interview session not found",
      });
    }
    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

exports.startSession = async (req, res, next) => {
  try {
    const session = await AiInterviewSession.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "AI interview session not found",
      });
    }

    if (session.status !== "setup" && session.messages.length > 0) {
      return res.status(200).json({
        success: true,
        data: session,
      });
    }

    const turn = await aiInterviewerService.generateOpeningTurn(
      session,
      req.user.name
    );

    session.status = "active";
    session.startedAt = new Date();
    session.currentQuestionIndex = 1;
    session.messages.push({
      role: "interviewer",
      content: turn.reply,
      topic: turn.topic || "Introduction",
      questionIndex: 1,
      timestamp: new Date(),
    });
    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    if (err.code === "AI_NOT_CONFIGURED") {
      return res.status(503).json({
        success: false,
        code: err.code,
        message: err.message,
      });
    }
    next(err);
  }
};

exports.submitTurn = async (req, res, next) => {
  try {
    const parsed = turnSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
    }

    const session = await AiInterviewSession.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "AI interview session not found",
      });
    }
    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This interview session is already completed.",
      });
    }

    const { answer, durationMs } = parsed.data;
    session.messages.push({
      role: "candidate",
      content: answer.trim(),
      questionIndex: session.currentQuestionIndex,
      durationMs,
      timestamp: new Date(),
    });

    const turn = await aiInterviewerService.generateNextTurn(
      session,
      answer.trim(),
      req.user.name
    );

    if (!turn.shouldEnd) {
      session.currentQuestionIndex = Math.min(
        session.currentQuestionIndex + 1,
        session.totalQuestions
      );
    }

    session.messages.push({
      role: "interviewer",
      content: turn.reply,
      topic: turn.topic || "Follow-up",
      questionIndex: session.currentQuestionIndex,
      timestamp: new Date(),
    });

    if (turn.shouldEnd) {
      session.status = "completed";
      session.endedAt = new Date();
      session.durationSeconds = session.startedAt
        ? Math.max(1, Math.round((session.endedAt - session.startedAt) / 1000))
        : 0;
      session.evaluation = await aiInterviewerService.generateSessionEvaluation(session);
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: {
        session,
        latestTurn: turn,
      },
    });
  } catch (err) {
    if (err.code === "AI_NOT_CONFIGURED") {
      return res.status(503).json({
        success: false,
        code: err.code,
        message: err.message,
      });
    }
    next(err);
  }
};

exports.endSession = async (req, res, next) => {
  try {
    const session = await AiInterviewSession.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "AI interview session not found",
      });
    }

    if (session.status === "completed" && session.evaluation) {
      return res.status(200).json({
        success: true,
        data: session,
      });
    }

    session.status = "completed";
    session.endedAt = new Date();
    session.durationSeconds = session.startedAt
      ? Math.max(1, Math.round((session.endedAt - session.startedAt) / 1000))
      : 0;

    const hasCandidateAnswers = session.messages.some((m) => m.role === "candidate");
    if (hasCandidateAnswers) {
      session.evaluation = await aiInterviewerService.generateSessionEvaluation(session);
    } else {
      session.evaluation = {
        overallScore: 0,
        recommendation: "no",
        summary: "The session ended before any candidate responses were recorded.",
        dimensions: {
          communication: { score: 1, notes: "No responses recorded." },
          roleKnowledge: { score: 1, notes: "No responses recorded." },
          problemSolving: { score: 1, notes: "No responses recorded." },
          confidenceAndClarity: { score: 1, notes: "No responses recorded." },
        },
        strengths: ["Session initialized"],
        improvements: ["Complete at least a few questions to receive a full evaluation."],
        questionFeedback: [],
      };
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    if (err.code === "AI_NOT_CONFIGURED") {
      return res.status(503).json({
        success: false,
        code: err.code,
        message: err.message,
      });
    }
    next(err);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const deleted = await AiInterviewSession.findOneAndDelete({
      sessionId: req.params.sessionId,
      user: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "AI interview session not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Session deleted",
    });
  } catch (err) {
    next(err);
  }
};

exports.textToSpeech = async (req, res, next) => {
  try {
    const { text, persona, speed } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required for speech synthesis.",
      });
    }
    const audioBuffer = await voiceService.synthesizeSpeech({
      text: String(text),
      persona: persona === "hr" ? "hr" : "technical",
      speed,
    });
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    res.send(audioBuffer);
  } catch (err) {
    next(err);
  }
};

exports.speechToText = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required.",
      });
    }
    const result = await voiceService.transcribeAudio({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype || "audio/webm",
      originalname: req.file.originalname || "recording.webm",
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
