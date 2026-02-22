import { Request, Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger';
import { CodeSnapshot } from '../models/codeSnapshot.model';
import { InterviewSession } from '../models/session.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Judge0 language IDs (CE - Community Edition)
const languageMap: Record<string, number> = {
  javascript: 93, // Node.js
  typescript: 94, // TypeScript
  python: 71,     // Python 3
  java: 91,       // Java
  cpp: 54,        // C++ (GCC 9.2.0)
  go: 95,         // Go
  rust: 73,       // Rust
};

export const executeCode = async (req: AuthRequest, res: Response) => {
  try {
    const { language, code, roomId, sessionId } = req.body;

    if (!language || !code || !roomId || !sessionId) {
      res.status(400).json({ success: false, message: 'Missing required parameters' });
      return;
    }

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      res.status(400).json({ success: false, message: `Unsupported language: ${language}` });
      return;
    }

    // Proxy request to Judge0
    const judgeApiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    const apiKey = process.env.JUDGE0_API_KEY;

    if (!apiKey) {
      logger.error('JUDGE0_API_KEY is missing in environment variables');
      res.status(500).json({ success: false, message: 'Code execution service unavailable' });
      return;
    }

    const submissionParams = {
      source_code: code,
      language_id: languageId,
      stdin: req.body.stdin || '',
    };

    const headers: any = {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': new URL(judgeApiUrl).hostname,
    };

    // Create Submission
    const submitResponse = await axios.post(`${judgeApiUrl}/submissions?base64_encoded=false&wait=true`, submissionParams, {
        headers,
        timeout: 10000 // 10 seconds max wait
    });

    const result = submitResponse.data;

    const executionResult = {
      stdout: result.stdout || '',
      stderr: result.stderr || result.compile_output || '',
      time: result.time || '0',
      memory: result.memory || 0,
    };

    // Save snapshot to DB
    const snapshot = await CodeSnapshot.create({
      room: roomId,
      session: sessionId,
      language,
      code,
      triggeredBy: 'manual',
      executionResult,
    });

    // Link snapshot to Session
    await InterviewSession.findByIdAndUpdate(sessionId, {
        $push: { codeSnapshots: snapshot._id }
    });

    res.status(200).json({
      success: true,
      data: {
        snapshotId: snapshot._id,
        ...executionResult
      }
    });

  } catch (error: any) {
    logger.error('Execute code error:', error.response?.data || error.message);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to execute code',
        error: error.response?.data || error.message
    });
  }
};
