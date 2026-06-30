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

function waitUntilPlayable(audio: HTMLAudioElement) {
  if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    function cleanup() {
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onError);
    }

    function onReady() {
      cleanup();
      resolve();
    }

    function onError() {
      cleanup();
      reject(new Error("Audio failed to load"));
    }

    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

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
  const [needsGesture, setNeedsGesture] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const skipResetRef = useRef(true);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !enabled || !url) {
      return false;
    }

    if (!audio.paused) {
      setPlaying(true);
      setNeedsGesture(false);
      return true;
    }

    audio.volume = 0.45;

    try {
      await waitUntilPlayable(audio);
      await audio.play();
      setPlaying(true);
      setNeedsGesture(false);
      return true;
    } catch {
      setPlaying(false);
      setNeedsGesture(true);
      return false;
    }
  }, [enabled, url]);

  useImperativeHandle(ref, () => ({ start: startPlayback }), [startPlayback]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (skipResetRef.current) {
      skipResetRef.current = false;
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
    setNeedsGesture(false);
  }, [url, enabled]);

  useEffect(() => {
    if (!autoStart || !enabled || !url) {
      return;
    }

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    let disposed = false;

    function handleCanPlay() {
      if (!disposed) {
        void startPlayback();
      }
    }

    void startPlayback();
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      disposed = true;
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [autoStart, enabled, startPlayback, url]);

  useEffect(() => {
    if (!needsGesture || !enabled || !url) {
      return;
    }

    function handleGesture() {
      void startPlayback();
    }

    document.addEventListener("pointerdown", handleGesture, { once: true });
    document.addEventListener("keydown", handleGesture, { once: true });

    return () => {
      document.removeEventListener("pointerdown", handleGesture);
      document.removeEventListener("keydown", handleGesture);
    };
  }, [enabled, needsGesture, startPlayback, url]);

  async function toggleMusic() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      setNeedsGesture(false);
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
