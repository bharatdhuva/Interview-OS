/**
 * controllers/feedback.controller.ts
 *
 * Interview feedback handlers.
 *
 * Endpoints:
 *  POST   /api/v1/feedback              — submitFeedback
 *  GET    /api/v1/feedback/:roomId      — getFeedbackForRoom
 *  PATCH  /api/v1/feedback/:roomId/share — shareFeedbackWithCandidate
 *
 * Visibility model:
 *  - Only the interviewer can submit and share feedback.
 *  - The candidate can read feedback only after the interviewer shares it.
 *  - Admins can always read all feedback.
 */

import { Response } from 'express';
import { Feedback } from '../models/feedback.model';
import { InterviewRoom } from '../models/room.model';
import { InterviewSession } from '../models/session.model';
import logger from '../utils/logger';
import { submitFeedbackSchema } from '../middleware/validation/feedback.validation';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * POST /api/v1/feedback  (interviewer only)
 *
 * Submits structured feedback for a completed interview.
 * - Copies the session’s violation log into the feedback document so HR
 *   has an immutable proctoring snapshot even if the session is purged.
 * - Feedback is private until the interviewer explicitly calls /share.
 */
export const submitFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = submitFeedbackSchema.parse(req.body);

    const room = await InterviewRoom.findById(validatedData.roomId);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    // Only the room’s interviewer may submit feedback
    if (room.interviewer.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Only interviewer can submit feedback' });
      return;
    }

    // Snapshot the violation log from the session at submission time
    const session = await InterviewSession.findById(validatedData.sessionId);
    const proctoringViolations = session?.violationLog?.length ? session.violationLog : null;

    const feedback = await Feedback.create({
      room:              validatedData.roomId,
      session:           validatedData.sessionId,
      interviewer:       req.user?.id,
      candidate:         room.candidate,
      ratings:           validatedData.ratings,
      strengths:         validatedData.strengths,
      improvements:      validatedData.improvements,
      overallNotes:      validatedData.overallNotes,
      recommendation:    validatedData.recommendation,
      proctoringViolations,
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error: any) {
    logger.error('Error submitting feedback', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to submit feedback' });
  }
};

/**
 * GET /api/v1/feedback/:roomId
 *
 * Returns the feedback document for a room.
 * - Candidates may only read it once `isSharedWithCandidate` is true.
 * - Interviewers and admins always have access.
 */
export const getFeedbackForRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findOne({ room: req.params.roomId })
      .populate('interviewer', 'name avatar')
      .populate('candidate',   'name avatar');

    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback not found' });
      return;
    }

    const isCandidate   = (feedback.candidate as any)._id.toString() === req.user?.id;
    const isInterviewer = (feedback.interviewer as any)._id.toString() === req.user?.id;

    // Block candidates from reading until the interviewer shares
    if (isCandidate && !feedback.isSharedWithCandidate) {
      res.status(403).json({ success: false, message: 'Feedback has not been shared with the candidate yet' });
      return;
    }

    // Only the two participants + admins have any access at all
    if (!isCandidate && !isInterviewer && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to view this feedback' });
      return;
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (error: any) {
    logger.error('Error fetching feedback', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PATCH /api/v1/feedback/:roomId/share  (interviewer only)
 *
 * Flips the `isSharedWithCandidate` flag to true, granting the candidate
 * read access to the feedback document.
 */
export const shareFeedbackWithCandidate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const feedback = await Feedback.findOne({ room: req.params.roomId });

    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback not found' });
      return;
    }

    if ((feedback.interviewer as any).toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Only interviewer can share feedback' });
      return;
    }

    feedback.isSharedWithCandidate = true;
    await feedback.save();

    res.status(200).json({ success: true, message: 'Feedback shared successfully' });
  } catch (error: any) {
    logger.error('Error sharing feedback', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
