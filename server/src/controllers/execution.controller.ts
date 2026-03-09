import { Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger';
import { CodeSnapshot } from '../models/codeSnapshot.model';
import { InterviewSession } from '../models/session.model';
import { InterviewRoom } from '../models/room.model';
import { AuthRequest } from '../middleware/auth.middleware';

const languageMap: Record<string, number> = {
  javascript: 93,
  typescript: 94,
  python: 71,
  java: 91,
  cpp: 54,
  go: 95,
  rust: 73,
};

export const executeCode = async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.roomId || req.body.roomId;
    const { language, code, sessionId } = req.body;

    if (!language || !code || !roomId || !sessionId) {
      res.status(400).json({ success: false, message: 'Missing required parameters' });
      return;
    }

    // Verify room exists and user is a participant
    const room = await InterviewRoom.findById(roomId);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    const userId = req.user?.id;
    const isParticipant =
      room.interviewer.toString() === userId ||
      room.candidate?.toString() === userId ||
      req.user?.role === 'admin';

    if (!isParticipant) {
      res.status(403).json({ success: false, message: 'Not authorized to execute code in this room' });
      return;
    }

    if (room.status !== 'active') {
      res.status(400).json({ success: false, message: 'Code execution is only allowed during an active session' });
      return;
    }

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      res.status(400).json({ success: false, message: `Unsupported language: ${language}` });
      return;
    }

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

    const headers = {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': new URL(judgeApiUrl).hostname,
    };

    const submitResponse = await axios.post(
      `${judgeApiUrl}/submissions?base64_encoded=false&wait=true`,
      submissionParams,
      { headers, timeout: 10000 }
    );

    const result = submitResponse.data;
    const executionResult = {
      stdout: result.stdout || '',
      stderr: result.stderr || result.compile_output || '',
      time: result.time || '0',
      memory: result.memory || 0,
    };

    const snapshot = await CodeSnapshot.create({
      room: roomId,
      session: sessionId,
      language,
      code,
      triggeredBy: 'manual',
      executionResult,
    });

    await InterviewSession.findByIdAndUpdate(sessionId, {
      $push: { codeSnapshots: snapshot._id },
    });

    res.status(200).json({
      success: true,
      data: { snapshotId: snapshot._id, ...executionResult },
    });
  } catch (error: any) {
    logger.error('Execute code error', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to execute code' });
  }
};
