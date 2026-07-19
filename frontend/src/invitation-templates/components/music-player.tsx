"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type InvitationMusicPlayerProps = Readonly<{
  autoStart?: boolean;
  enabled: boolean;
  title: string;
  url: string;
}>;

export type InvitationMusicPlayerHandle = {
  start: () => Promise<boolean>;
};

const TAP_UNLOCK_EVENTS = ["pointerdown", "touchstart", "click", "keydown"] as const;
const SCROLL_UNLOCK_EVENTS = ["scroll", "wheel", "touchmove"] as const;

export const InvitationMusicPlayer = forwardRef<
  InvitationMusicPlayerHandle,
  InvitationMusicPlayerProps
>(function InvitationMusicPlayer(
  { autoStart = true, enabled, title, url },
  ref,
) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackAbortRef = useRef<AbortController | null>(null);
  const skipResetRef = useRef(true);
  const chipRef = useRef<HTMLButtonElement>(null);
  const unlockPendingRef = useRef(autoStart);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !enabled || !url) {
      return false;
    }

    if (!audio.paused) {
      setPlaying(true);
      return true;
    }

    playbackAbortRef.current?.abort();
    const controller = new AbortController();
    playbackAbortRef.current = controller;
    audio.volume = 0.45;

    try {
      await audio.play();

      if (controller.signal.aborted) {
        return false;
      }

      setPlaying(true);
      return true;
    } catch {
      if (controller.signal.aborted) {
        return false;
      }

      setPlaying(false);
      return false;
    } finally {
      if (playbackAbortRef.current === controller) {
        playbackAbortRef.current = null;
      }
    }
  }, [enabled, url]);

  useImperativeHandle(ref, () => ({ start: startPlayback }), [startPlayback]);

  useEffect(() => {
    return () => playbackAbortRef.current?.abort();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (skipResetRef.current) {
      skipResetRef.current = false;
      return;
    }

    playbackAbortRef.current?.abort();
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
    unlockPendingRef.current = autoStart;
  }, [autoStart, url, enabled]);

  useEffect(() => {
    if (!autoStart || !enabled || !url) {
      return;
    }

    void startPlayback();
  }, [autoStart, enabled, startPlayback, url]);

  useEffect(() => {
    if (!autoStart || !enabled || !url) {
      return;
    }

    unlockPendingRef.current = true;
    let active = true;
    let gestureAttempt = false;

    function isMusicChipEvent(event: Event) {
      const chip = chipRef.current;
      const target = event.target;

      return Boolean(
        chip && target instanceof Node && chip.contains(target),
      );
    }

    function removeGestureListeners() {
      for (const eventName of TAP_UNLOCK_EVENTS) {
        document.removeEventListener(eventName, handleGesture, true);
      }

      for (const eventName of SCROLL_UNLOCK_EVENTS) {
        window.removeEventListener(eventName, handleGesture, true);
      }
    }

    async function handleGesture(event: Event) {
      // Ignore chip taps (own toggle) and the click that follows pointerdown.
      if (
        !unlockPendingRef.current ||
        gestureAttempt ||
        isMusicChipEvent(event)
      ) {
        return;
      }

      gestureAttempt = true;

      try {
        const started = await startPlayback();

        if (!active || !started) {
          return;
        }

        unlockPendingRef.current = false;
        removeGestureListeners();
      } finally {
        gestureAttempt = false;
      }
    }

    for (const eventName of TAP_UNLOCK_EVENTS) {
      document.addEventListener(eventName, handleGesture, {
        capture: true,
      });
    }

    // First scroll / swipe also unlocks autoplay (mobile guests rarely tap first).
    for (const eventName of SCROLL_UNLOCK_EVENTS) {
      window.addEventListener(eventName, handleGesture, {
        capture: true,
        passive: true,
      });
    }

    return () => {
      active = false;
      removeGestureListeners();
    };
  }, [autoStart, enabled, startPlayback, url]);

  async function toggleMusic() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      unlockPendingRef.current = false;
      return;
    }

    unlockPendingRef.current = false;
    await startPlayback();
  }

  if (!enabled || !url) {
    return null;
  }

  return (
    <button
      aria-label={playing ? "Отключить музыку" : "Включить музыку"}
      className={`invite-music ${playing ? "is-playing" : ""}`}
      onClick={() => {
        void toggleMusic();
      }}
      ref={chipRef}
      type="button"
    >
      <audio loop preload={autoStart ? "auto" : "none"} ref={audioRef} src={url} />
      <span aria-hidden className="invite-music__toggle">
        {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </span>
      <span className="invite-music__copy">
        <Music2 aria-hidden size={13} />
        <span>
          <small>{playing ? "Сейчас играет" : "Музыка выключена"}</small>
          <strong>{title || "Мелодия приглашения"}</strong>
        </span>
      </span>
    </button>
  );
});
