/**
 * controllers/execution.controller.ts
 *
 * Code execution via the Judge0 API.
 *
 * Flow:
 *  1. Validate presence of required fields (language, code, roomId, sessionId).
 *  2. Verify the room exists and the caller is a participant.
 *  3. Ensure the session is currently active (execution blocked outside sessions).
 *  4. Map the language name to a Judge0 language ID.
 *  5. Submit code to Judge0 with wait=true (synchronous result in one request).
 *  6. Persist a CodeSnapshot and link it to the session.
 *  7. Return execution output to the client.
 */

import { Response } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { CodeSnapshot } from '../models/codeSnapshot.model';
import { InterviewSession } from '../models/session.model';
import { InterviewRoom } from '../models/room.model';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Maps language name strings (as sent by the editor) to Judge0 language IDs.
 * @see https://ce.judge0.com/languages
 */
const languageMap: Record<string, number> = {
  javascript: 93,
  typescript: 94,
  python:     71,
  java:       91,
  cpp:        54,
  go:         95,
  rust:       73,
};

/**
 * POST /api/v1/rooms/:roomId/code/execute
 *
 * Executes the submitted code against the Judge0 sandbox and returns stdout,
 * stderr, execution time, and memory usage.  Also creates a CodeSnapshot
 * document linked to the current session for the interviewer’s review.
 */
export const executeCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // roomId can come from the URL param (mergeParams) or the body
    const requestedRoomId = req.params.roomId || req.body.roomId;
    const { language, code, sessionId } = req.body;

    if (!language || !code || !requestedRoomId) {
      res.status(400).json({ success: false, message: 'Missing required parameters' });
      return;
    }

    // Verify the room exists
    const roomQuery = mongoose.Types.ObjectId.isValid(requestedRoomId)
      ? { _id: requestedRoomId }
      : { roomId: requestedRoomId };
    const room = await InterviewRoom.findOne(roomQuery);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    const resolvedSession = sessionId
      ? await InterviewSession.findById(sessionId)
      : await InterviewSession.findOne({ room: room._id, endTime: { $exists: false } }).sort({ startTime: -1 });

    if (!resolvedSession) {
      res.status(400).json({ success: false, message: 'No active session found for this room' });
      return;
    }

    // Only room participants (or admins) may execute code
    const userId = req.user?.id;
    const isParticipant =
      room.interviewer.toString() === userId ||
      room.candidate?.toString()  === userId ||
      req.user?.role === 'admin';

    if (!isParticipant) {
      res.status(403).json({ success: false, message: 'Not authorized to execute code in this room' });
      return;
    }

    // Code execution is only meaningful during an active session
    if (room.status !== 'active') {
      res.status(400).json({ success: false, message: 'Code execution is only allowed during an active session' });
      return;
    }

    // Resolve the language name to a Judge0 language ID
    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      res.status(400).json({ success: false, message: `Unsupported language: ${language}` });
      return;
    }

    const judgeApiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    const apiKey      = process.env.JUDGE0_API_KEY;

    if (!apiKey) {
      logger.error('JUDGE0_API_KEY is missing in environment variables');
      res.status(500).json({ success: false, message: 'Code execution service unavailable' });
      return;
    }

    // Build the Judge0 submission payload
    const submissionParams = {
      source_code: code,
      language_id: languageId,
      stdin:       req.body.stdin || '', // optional user-supplied input
    };

    const headers = {
      'Content-Type':    'application/json',
      'X-RapidAPI-Key':  apiKey,
      'X-RapidAPI-Host': new URL(judgeApiUrl).hostname,
    };

    // Use wait=true so Judge0 returns the result directly (no polling needed)
    const submitResponse = await axios.post(
      `${judgeApiUrl}/submissions?base64_encoded=false&wait=true`,
      submissionParams,
      { headers, timeout: 10000 }
    );

    const result = submitResponse.data;
    const executionResult = {
      stdout: result.stdout || '',
      stderr: result.stderr || result.compile_output || '', // compile errors appear in compile_output
      time:   result.time   || '0',
      memory: result.memory || 0,
    };

    // Persist the code + result as a snapshot for the session timeline
    const snapshot = await CodeSnapshot.create({
      room: room._id,
      session: resolvedSession._id,
      language,
      code,
      triggeredBy: 'manual',
      executionResult,
    });

    // Link the snapshot to the session’s codeSnapshots array
    await InterviewSession.findByIdAndUpdate(resolvedSession._id, {
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
