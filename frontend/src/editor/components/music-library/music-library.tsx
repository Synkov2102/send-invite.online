"use client";

import { Check, ExternalLink, Pause, Play, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  editorMusicTracks,
  type EditorMusicTrack,
  getEditorMusicTrackByUrl,
} from "../../music-tracks";
import styles from "./music-library.module.css";

type MusicLibraryProps = {
  musicUrl: string;
  onSelect: (track: EditorMusicTrack) => void;
};

function matchesQuery(track: EditorMusicTrack, query: string) {
  if (!query) return true;
  const haystack = `${track.title} ${track.author}`.toLowerCase();
  return haystack.includes(query);
}

export function MusicLibrary({ musicUrl, onSelect }: MusicLibraryProps) {
  const searchId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [query, setQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const selectedTrack = getEditorMusicTrackByUrl(musicUrl);
  const normalizedQuery = query.trim().toLowerCase();
  const tracks = editorMusicTracks.filter((track) =>
    matchesQuery(track, normalizedQuery),
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    function handleEnded() {
      setPlayingId(null);
    }

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedTrack || !listRef.current) return;
    const node = listRef.current.querySelector<HTMLElement>(
      `[data-track-id="${selectedTrack.id}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [selectedTrack]);

  function stopPreview() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlayingId(null);
  }

  function handleSelect(track: EditorMusicTrack) {
    onSelect(track);
  }

  async function handlePreview(track: EditorMusicTrack) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === track.id) {
      stopPreview();
      return;
    }

    onSelect(track);
    audio.src = track.audioUrl;
    setPlayingId(track.id);

    try {
      await audio.play();
    } catch {
      setPlayingId(null);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.headCopy}>
          <strong>Коллекция мелодий</strong>
          <span>{editorMusicTracks.length} треков · Pixabay</span>
        </div>
        {selectedTrack ? (
          <a
            className={styles.sourceLink}
            href={selectedTrack.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Источник
            <ExternalLink aria-hidden size={12} />
          </a>
        ) : null}
      </div>

      <label className={styles.search} htmlFor={searchId}>
        <Search aria-hidden className={styles.searchIcon} size={15} />
        <input
          autoComplete="off"
          id={searchId}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Название или автор"
          type="search"
          value={query}
        />
      </label>

      <div
        aria-label="Мелодии из коллекции"
        className={styles.list}
        ref={listRef}
        role="listbox"
      >
        {tracks.length === 0 ? (
          <p className={styles.empty}>Ничего не найдено. Попробуйте другой запрос.</p>
        ) : (
          tracks.map((track, index) => {
            const isSelected = selectedTrack?.id === track.id;
            const isPlaying = playingId === track.id;

            return (
              <div
                aria-selected={isSelected}
                className={[
                  styles.track,
                  isSelected ? styles.trackSelected : "",
                  isPlaying ? styles.trackPlaying : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-track-id={track.id}
                key={track.id}
                role="option"
              >
                <button
                  aria-label={
                    isPlaying
                      ? `Пауза: ${track.title}`
                      : `Прослушать: ${track.title}`
                  }
                  className={styles.play}
                  onClick={() => {
                    void handlePreview(track);
                  }}
                  type="button"
                >
                  <span aria-hidden className={styles.bars}>
                    <i style={{ animationDelay: `${(index % 4) * 80}ms` }} />
                    <i style={{ animationDelay: `${(index % 4) * 80 + 40}ms` }} />
                    <i style={{ animationDelay: `${(index % 4) * 80 + 80}ms` }} />
                  </span>
                  {isPlaying ? (
                    <Pause aria-hidden size={14} />
                  ) : (
                    <Play aria-hidden size={14} />
                  )}
                </button>

                <button
                  className={styles.trackBody}
                  onClick={() => {
                    stopPreview();
                    handleSelect(track);
                  }}
                  type="button"
                >
                  <span className={styles.trackTitle}>{track.title}</span>
                  <span className={styles.trackMeta}>
                    {track.author}
                    <span aria-hidden>·</span>
                    {track.duration}
                  </span>
                </button>

                {isSelected ? (
                  <span className={styles.selectedMark} aria-hidden>
                    <Check size={14} />
                  </span>
                ) : (
                  <span className={styles.duration}>{track.duration}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedTrack ? (
        <div className={styles.selectedCard}>
          <div>
            <strong>{selectedTrack.title}</strong>
            <span>
              {selectedTrack.author} · {selectedTrack.duration}
            </span>
          </div>
          <button
            aria-label={
              playingId === selectedTrack.id
                ? "Остановить прослушивание"
                : "Прослушать выбранную мелодию"
            }
            className={styles.selectedPlay}
            onClick={() => {
              void handlePreview(selectedTrack);
            }}
            type="button"
          >
            {playingId === selectedTrack.id ? (
              <>
                <Pause aria-hidden size={15} />
                Пауза
              </>
            ) : (
              <>
                <Play aria-hidden size={15} />
                Слушать
              </>
            )}
          </button>
        </div>
      ) : (
        <p className={styles.hint}>Выберите мелодию из списка или укажите свою ссылку ниже.</p>
      )}
    </div>
  );
}
