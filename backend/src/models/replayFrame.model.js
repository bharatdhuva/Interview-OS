const mongoose = require("mongoose");

const replayFrameSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["code", "whiteboard", "violation", "chat", "execution"],
    },
    timestamp: { type: Number, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

const ReplayFrame = mongoose.model("ReplayFrame", replayFrameSchema);

module.exports = { ReplayFrame };
