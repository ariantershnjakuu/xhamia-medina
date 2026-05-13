import { useEffect, useState, useCallback } from 'react';

export function useFullscreenKiosk() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const checkFullscreen = useCallback(() => {
        return !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
        );
    }, []);

    const enterFullscreen = useCallback(async () => {
        if (checkFullscreen()) return;

        const el = document.documentElement as any;
        try {
            if (el.requestFullscreen) {
                await el.requestFullscreen();
            } else if (el.webkitRequestFullscreen) {
                await el.webkitRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
                await el.mozRequestFullScreen();
            } else if (el.msRequestFullscreen) {
                await el.msRequestFullscreen();
            }
        } catch (err) {
            console.warn("Fullscreen request blocked or failed", err);
        }
    }, [checkFullscreen]);

    useEffect(() => {
        let retryTimer: ReturnType<typeof setTimeout> | null = null;

        const handleFullscreenChange = () => {
            const inFs = checkFullscreen();
            setIsFullscreen(inFs);

            // Kiosk persistence: once the user has activated kiosk mode, treat
            // any fullscreen exit as accidental (browser quirk, refocus during
            // refetch, redraw glitch on TV WebViews) and re-request. A short
            // delay lets the browser settle before we ask again.
            if (!inFs && hasInteracted) {
                if (retryTimer) clearTimeout(retryTimer);
                retryTimer = setTimeout(() => {
                    void enterFullscreen();
                }, 100);
            }
        };

        // Listen to all vendor prefixes
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        // Initial check
        handleFullscreenChange();

        return () => {
            if (retryTimer) clearTimeout(retryTimer);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [checkFullscreen, enterFullscreen, hasInteracted]);

    useEffect(() => {
        // Auto-enter fullscreen on any interaction if not in fullscreen
        const handleInteraction = () => {
            if (!hasInteracted) setHasInteracted(true);
            if (!checkFullscreen()) {
                enterFullscreen();
            }
        };

        // Only apply if the interaction requires a user gesture
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [checkFullscreen, enterFullscreen, hasInteracted]);

    return { isFullscreen, hasInteracted, enterFullscreen };
}
