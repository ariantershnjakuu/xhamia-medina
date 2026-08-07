import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Delays (ms) between re-entry attempts after an unexpected fullscreen exit.
 * Escalating, and deliberately finite: most browsers reject requestFullscreen()
 * without a user gesture, so after these we stop burning cycles and wait for
 * the next touch/click/keypress instead.
 */
const REENTRY_BACKOFF_MS = [100, 500, 2_000, 5_000];

/** Vendor-prefixed fullscreen surface, still needed by older TV WebViews. */
type FullscreenDocument = Document & {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    mozRequestFullScreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
};

export function useFullscreenKiosk() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Mirror of `hasInteracted` read from listeners, so the effects below can
    // register once on mount instead of tearing down on every state change.
    const hasInteractedRef = useRef(false);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryIndexRef = useRef(0);

    const checkFullscreen = useCallback(() => {
        const doc = document as FullscreenDocument;
        return !!(
            doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement
        );
    }, []);

    const enterFullscreen = useCallback(async () => {
        if (checkFullscreen()) return;

        const el = document.documentElement as FullscreenElement;
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
        const cancelReentry = () => {
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
                retryTimerRef.current = null;
            }
            retryIndexRef.current = 0;
        };

        const scheduleReentry = () => {
            if (retryTimerRef.current) return; // one chain at a time
            const attempt = retryIndexRef.current;
            if (attempt >= REENTRY_BACKOFF_MS.length) return;

            retryTimerRef.current = setTimeout(async () => {
                retryTimerRef.current = null;
                retryIndexRef.current = attempt + 1;
                if (checkFullscreen() || !hasInteractedRef.current) return;

                await enterFullscreen();
                // On success 'fullscreenchange' fires and cancels the chain.
                if (!checkFullscreen()) scheduleReentry();
            }, REENTRY_BACKOFF_MS[attempt]);
        };

        const handleFullscreenChange = () => {
            const inFs = checkFullscreen();
            setIsFullscreen(inFs);

            if (inFs) {
                cancelReentry();
                return;
            }

            // Kiosk persistence: once the user has activated kiosk mode, treat
            // any fullscreen exit as accidental (browser quirk, redraw glitch on
            // TV WebViews) and re-request. Note this cannot rescue a *page
            // reload* — the Fullscreen API needs a real user gesture — which is
            // why nothing in this app reloads itself; see useDailyRefresh.
            if (hasInteractedRef.current) scheduleReentry();
        };

        // Listen to all vendor prefixes
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        // Initial check
        handleFullscreenChange();

        return () => {
            cancelReentry();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [checkFullscreen, enterFullscreen]);

    useEffect(() => {
        // Auto-enter fullscreen on any interaction if not in fullscreen
        const handleInteraction = () => {
            hasInteractedRef.current = true;
            setHasInteracted(true);
            // A real gesture — reset the budget so re-entry gets a fresh chain.
            retryIndexRef.current = 0;
            if (!checkFullscreen()) {
                void enterFullscreen();
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
    }, [checkFullscreen, enterFullscreen]);

    return { isFullscreen, hasInteracted, enterFullscreen };
}
