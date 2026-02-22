import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type ViolationType = 
  | 'fullscreen_exit'
  | 'tab_switch'
  | 'window_blur'
  | 'paste_attempt'
  | 'suspicious_paste';

interface UseProctorProps {
  roomId?: string;
  onViolation?: (type: ViolationType, count: number) => void;
  onEndSession?: () => void;
  maxViolations?: number;
}

export const useProctor = ({
  roomId,
  onViolation,
  onEndSession,
  maxViolations = 3
}: UseProctorProps = {}) => {
  const [violationCount, setViolationCount] = useState(0);
  const { toast } = useToast();

  const triggerWarning = useCallback((type: ViolationType) => {
    setViolationCount((prev) => {
      const nextCount = prev + 1;
      
      let title = "Violation Detected";
      let description = "";

      switch (type) {
        case 'fullscreen_exit':
          title = "Fullscreen Exited";
          description = "Please stay in fullscreen mode during the interview.";
          break;
        case 'tab_switch':
          title = "Tab Switch Detected";
          description = "Switching tabs is not allowed. This has been logged.";
          break;
        case 'window_blur':
          title = "Window Focus Lost";
          description = "Please keep this window focused.";
          break;
        case 'paste_attempt':
          title = "Paste Blocked";
          description = "Copy-pasting code is restricted in this session.";
          break;
        case 'suspicious_paste':
          title = "Suspicious Activity";
          description = "Large code block insertion detected.";
          break;
      }

      toast({
        title: `${title} (${nextCount}/${maxViolations})`,
        description,
        variant: "destructive",
      });

      if (onViolation) onViolation(type, nextCount);

      if (nextCount >= maxViolations) {
        toast({
          title: "Session Terminated",
          description: "Maximum violations reached. The session will now close.",
          variant: "destructive",
        });
        if (onEndSession) onEndSession();
      }

      return nextCount;
    });
  }, [maxViolations, onViolation, onEndSession, toast]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerWarning('fullscreen_exit');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerWarning('tab_switch');
      }
    };

    const handleBlur = () => {
      triggerWarning('window_blur');
    };

    // Listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [triggerWarning]);

  const enterFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  }, []);

  return {
    violationCount,
    triggerWarning,
    enterFullscreen
  };
};
