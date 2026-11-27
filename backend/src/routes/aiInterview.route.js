const express = require("express");
const multer = require("multer");
const expressRateLimit = require("express-rate-limit");
const authMiddleware = require("../middleware/auth.middleware");
const aiInterviewController = require("../controllers/aiInterview.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/octet-stream",
    ];
    const extAllowed = /\.(pdf|txt|md)$/i.test(file.originalname || "");
    if (allowed.includes(file.mimetype) || extAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, TXT, or MD resume files are supported."));
    }
  },
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const aiTurnLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: "Too many AI interview requests, please slow down.",
  },
});

router.use(authMiddleware.protect);

router.get("/status", aiInterviewController.getStatus);
router.post("/parse-resume", upload.single("resume"), aiInterviewController.parseResume);
router.post("/tts", aiTurnLimiter, aiInterviewController.textToSpeech);
router.post("/stt", aiTurnLimiter, audioUpload.single("audio"), aiInterviewController.speechToText);
router.get("/sessions", aiInterviewController.listSessions);
router.post("/sessions", aiInterviewController.createSession);
router.get("/sessions/:sessionId", aiInterviewController.getSession);
router.post("/sessions/:sessionId/start", aiTurnLimiter, aiInterviewController.startSession);
router.post("/sessions/:sessionId/turn", aiTurnLimiter, aiInterviewController.submitTurn);
router.post("/sessions/:sessionId/end", aiTurnLimiter, aiInterviewController.endSession);
router.delete("/sessions/:sessionId", aiInterviewController.deleteSession);

module.exports = router;
