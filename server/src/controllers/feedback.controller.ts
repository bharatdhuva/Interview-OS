import { Request, Response } from 'express';
import { Feedback } from '../models/feedback.model';
import { InterviewRoom } from '../models/room.model';
import { InterviewSession } from '../models/session.model';
import logger from '../utils/logger';
import { submitFeedbackSchema } from '../middleware/validation/feedback.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const submitFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = submitFeedbackSchema.parse(req.body);
        
        const room = await InterviewRoom.findById(validatedData.roomId);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }

        if (room.interviewer.toString() !== req.user?.id) {
             res.status(403).json({ success: false, message: 'Only interviewer can submit feedback' });
             return;
        }

        // Check if session has proctoring violations
        const session = await InterviewSession.findById(validatedData.sessionId);
        let proctoringViolations = null;
        if (session && session.violationLog?.length > 0) {
            proctoringViolations = session.violationLog;
        }

        const feedback = await Feedback.create({
            room: validatedData.roomId,
            session: validatedData.sessionId,
            interviewer: req.user?.id,
            candidate: room.candidate,
            ratings: validatedData.ratings,
            strengths: validatedData.strengths,
            improvements: validatedData.improvements,
            overallNotes: validatedData.overallNotes,
            recommendation: validatedData.recommendation,
            proctoringViolations
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (error: any) {
        logger.error('Error submitting feedback', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to submit feedback' });
    }
}

export const getFeedbackForRoom = async (req: AuthRequest, res: Response) => {
    try {
         const feedback = await Feedback.findOne({ room: req.params.roomId })
            .populate('interviewer', 'name avatar')
            .populate('candidate', 'name avatar');

         if (!feedback) {
             res.status(404).json({ success: false, message: 'Feedback not found' });
             return;
         }

         const isCandidate = feedback.candidate._id.toString() === req.user?.id;
         const isInterviewer = feedback.interviewer._id.toString() === req.user?.id;

         if (isCandidate && !feedback.isSharedWithCandidate) {
              res.status(403).json({ success: false, message: 'Feedback has not been shared with the candidate yet' });
              return;
         }

         if (!isCandidate && !isInterviewer && req.user?.role !== 'admin') {
             res.status(403).json({ success: false, message: 'Not authorized to view this feedback' });
             return;
         }

         res.status(200).json({ success: true, data: feedback });
    } catch (error: any) {
         logger.error('Error fetching feedback', error);
         res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const shareFeedbackWithCandidate = async (req: AuthRequest, res: Response) => {
     try {
         const feedback = await Feedback.findOne({ room: req.params.roomId });

         if (!feedback) {
             res.status(404).json({ success: false, message: 'Feedback not found' });
             return;
         }

         if (feedback.interviewer.toString() !== req.user?.id) {
             res.status(403).json({ success: false, message: 'Only interviewer can share feedback' });
             return;
         }

         feedback.isSharedWithCandidate = true;
         await feedback.save();

         res.status(200).json({ success: true, message: 'Feedback shared successfully' });
     } catch(error: any) {
         logger.error('Error sharing feedback', error);
         res.status(500).json({ success: false, message: 'Server error' });
     }
}
