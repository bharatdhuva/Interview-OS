const mongoose = require("mongoose");

const aiEvaluationSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewRoom",
      required: true,
      index: true,
    },
    roomId: { type: String, required: true, index: true },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "ready", "failed"],
      default: "pending",
      index: true,
    },
    errorMessage: { type: String },
    promptName: { type: String, default: "evaluation" },
    promptVersion: { type: String, default: "v1" },
    provider: { type: String },
    model: { type: String },
    rubricScores: { type: mongoose.Schema.Types.Mixed },
    summary: { type: String },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    recommendation: {
      type: String,
      enum: ["strong_no", "no", "lean_no", "lean_yes", "yes", "strong_yes"],
    },
    confidence: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    missingSignals: [{ type: String }],
    insufficientEvidence: { type: Boolean, default: false },
    injectionSuspected: { type: Boolean, default: false },
    injectionFlags: { type: mongoose.Schema.Types.Mixed, default: [] },
    needsHumanReview: { type: Boolean, default: false },
    anomalies: [{ type: String }],
    tokens: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
    },
    cost: { type: Number, default: 0 },
    latency: { type: Number, default: 0 },
    // Populated in Phase 6 when interviewer edits and submits final feedback
    editedByInterviewer: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

exports.AiEvaluation = mongoose.model("AiEvaluation", aiEvaluationSchema);
