const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["tab-switch", "paste", "fullscreen-exit", "copy-attempt"],
    },
    timestamp: { type: Date, default: Date.now, index: true },
    strikeCount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Violation = mongoose.model("Violation", violationSchema);

module.exports = { Violation };
