const mongoose = require("mongoose");

const aiCallLogSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    promptName: { type: String, required: true },
    promptVersion: { type: String, required: true },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
    totalLatencyMs: { type: Number, required: true },
    ttftMs: { type: Number, default: null },
    outcome: {
      type: String,
      enum: ["success", "retried", "fallback", "failed"],
      required: true,
      index: true,
    },
    errorMessage: { type: String },
    roomId: { type: String, index: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "InterviewSession" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

exports.AiCallLog = mongoose.model("AiCallLog", aiCallLogSchema);
