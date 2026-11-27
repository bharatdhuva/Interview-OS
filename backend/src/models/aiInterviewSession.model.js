const mongoose = require("mongoose");

const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["interviewer", "candidate"],
      required: true,
    },
    content: { type: String, required: true },
    topic: { type: String, default: "" },
    questionIndex: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiInterviewSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    interviewType: {
      type: String,
      enum: ["technical", "hr"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["junior", "mid", "senior"],
      default: "mid",
    },
    targetRole: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    focusArea: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },
    resume: {
      fileName: { type: String, default: "" },
      rawText: { type: String, default: "" },
      parsedSkills: [{ type: String }],
    },
    status: {
      type: String,
      enum: ["setup", "active", "completed"],
      default: "setup",
      index: true,
    },
    totalQuestions: {
      type: Number,
      default: 6,
      min: 3,
      max: 12,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    messages: {
      type: [aiMessageSchema],
      default: [],
    },
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

exports.AiInterviewSession = mongoose.model(
  "AiInterviewSession",
  aiInterviewSessionSchema
);
