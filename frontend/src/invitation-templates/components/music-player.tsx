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
  }, [url, enabled]);

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

    function handleGesture() {
      void startPlayback();
    }

    document.addEventListener("click", handleGesture, {
      capture: true,
      once: true,
    });
    document.addEventListener("keydown", handleGesture, {
      capture: true,
      once: true,
    });

    return () => {
      document.removeEventListener("click", handleGesture, true);
      document.removeEventListener("keydown", handleGesture, true);
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
      return;
    }

    await startPlayback();
  }

  if (!enabled || !url) {
    return null;
  }

  return (
    <div className={`invite-music ${playing ? "is-playing" : ""}`}>
      <audio loop preload={autoStart ? "auto" : "none"} ref={audioRef} src={url} />
      <button
        aria-label={playing ? "Отключить музыку" : "Включить музыку"}
        className="invite-music__toggle"
        onClick={toggleMusic}
        type="button"
      >
        {playing ? <Volume2 aria-hidden size={18} /> : <VolumeX aria-hidden size={18} />}
      </button>
      <span className="invite-music__copy">
        <Music2 aria-hidden size={13} />
        <span>
          <small>{playing ? "Сейчас играет" : "Музыка выключена"}</small>
          <strong>{title || "Мелодия приглашения"}</strong>
        </span>
      </span>
    </div>
  );
});
