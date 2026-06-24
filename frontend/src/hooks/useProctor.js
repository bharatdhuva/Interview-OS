import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/useToast';

export const useProctor = ({ roomId, onViolation, onEndSession, maxViolations = 3, isEnabled = true, gracePeriodMs = 20000 } = {}) => {
    const [violationCount, setViolationCount] = useState(0);
    const { toast } = useToast();
    const mountedAtRef = useRef(Date.now());
    const lastViolationAtRef = useRef(0);
    const sessionEndedRef = useRef(false);

    const triggerWarning = useCallback((type) => {
        if (!isEnabled || sessionEndedRef.current) return;

        const now = Date.now();
        if (now - mountedAtRef.current < gracePeriodMs) return;
        if (now - lastViolationAtRef.current < 1500) return;

        lastViolationAtRef.current = now;

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
            if (onViolation)
                onViolation(type, nextCount);
            if (nextCount >= maxViolations) {
                sessionEndedRef.current = true;
                toast({
                    title: "Session Terminated",
                    description: "Maximum violations reached. The session will now close.",
                    variant: "destructive",
                });
                if (onEndSession)
                    onEndSession();
            }
            return nextCount;
        });
    }, [isEnabled, maxViolations, onViolation, onEndSession, toast, gracePeriodMs]);

    useEffect(() => {
        if (!isEnabled) return;
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
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isEnabled, triggerWarning]);

    const enterFullscreen = useCallback(() => {
        if (!isEnabled) return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }
    }, [isEnabled]);

    return {
        violationCount,
        triggerWarning,
        enterFullscreen
    };
};
