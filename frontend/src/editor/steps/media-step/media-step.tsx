"use client";

import { Button } from "@heroui/react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { imageUploadAccept } from "../../lib/prepare-image-upload";
import { FieldGroup, MusicLibrary, TextInput } from "../../components";
import panelStyles from "../../components/editor-step-panel/editor-step-panel.module.css";
import toggleStyles from "../../components/editor-toggle/editor-toggle.module.css";
import { useEditor } from "../../editor-context";
import styles from "./media-step.module.css";

type StepPanelProps = {
  isActive: boolean;
};

export function MediaStep({ isActive }: StepPanelProps) {
  const {
    coverImage,
    invite,
    isFullscreenPreview,
    photoError,
    portraitImage,
    resetImage,
    selectImageFile,
    selectMusicFile,
    updateInvite,
    venueImage,
  } = useEditor();

  const photoSlots = [
    {
      description: "Первое фото пары в начале приглашения",
      field: "coverImageUrl" as const,
      label: "Фото пары 1",
      src: coverImage,
    },
    {
      description: "Второе фото пары для финального блока",
      field: "portraitImageUrl" as const,
      label: "Фото пары 2",
      src: portraitImage,
    },
    {
      description: "Фото площадки или места церемонии",
      field: "venueImageUrl" as const,
      label: "Фото места",
      src: venueImage,
    },
  ];

  return (
    <section className={`${panelStyles.panel} ${isActive ? panelStyles.active : ""}`}>
      <FieldGroup
        title="Фото"
        description="Загрузите изображения, которые зададут настроение приглашения."
        hint="Нажмите на область фото или кнопку ниже — откроется галерея телефона."
      >
        <div className={styles.photoGrid}>
          {photoSlots.map((item) => (
            <div className={styles.photoUpload} key={item.field}>
              <label className={styles.photoUploadPicker}>
                <div
                  aria-hidden
                  className={styles.photoUploadPreview}
                  style={{ backgroundImage: `url(${item.src})` }}
                />
                <span className={styles.photoUploadPickerLabel}>
                  <ImagePlus aria-hidden size={18} />
                  <span>{item.src ? "Заменить фото" : "Выбрать фото"}</span>
                </span>
                <input
                  accept={imageUploadAccept}
                  onChange={(event) => {
                    void selectImageFile(item.field, event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                  type="file"
                />
              </label>

              <div className={styles.photoUploadBody}>
                <div className={styles.photoUploadCopy}>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </div>
                <div className={styles.photoUploadActions}>
                  <label className={styles.photoUploadButton}>
                    <ImagePlus aria-hidden size={15} />
                    <span>Загрузить</span>
                    <input
                      accept={imageUploadAccept}
                      onChange={(event) => {
                        void selectImageFile(item.field, event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                      type="file"
                    />
                  </label>
                  <Button
                    aria-label={`Сбросить ${item.label.toLowerCase()}`}
                    className={styles.photoUploadReset}
                    isDisabled={!invite[item.field]}
                    onClick={() => resetImage(item.field)}
                    type="button"
                    variant="outline"
                  >
                    <RotateCcw aria-hidden size={15} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {photoError ? (
          <p className={styles.photoError} role="alert">
            {photoError}
          </p>
        ) : null}
        <p className={styles.musicNote}>
          JPG, PNG, WEBP, GIF или HEIC до 8 МБ. Фото автоматически сжимается для
          предпросмотра и сохраняется в S3 при публикации.
        </p>
      </FieldGroup>

      <FieldGroup
        title="Музыка"
        description="Добавьте мелодию, которую гости смогут включить вручную."
        hint="Короткая и спокойная композиция меньше отвлекает от текста приглашения."
      >
        <label className={toggleStyles.toggle}>
          <span>
            <strong>Музыка в приглашении</strong>
            <small>Гость сам включает и отключает мелодию</small>
          </span>
          <input
            checked={invite.musicEnabled}
            onChange={(event) => updateInvite("musicEnabled", event.target.checked)}
            type="checkbox"
          />
        </label>
        {invite.musicEnabled ? (
          <div className={styles.musicSettings}>
            <MusicLibrary
              active={isActive && !isFullscreenPreview}
              musicUrl={invite.musicUrl}
              onSelect={(track) => {
                updateInvite("musicTitle", track.title);
                updateInvite("musicUrl", track.audioUrl);
              }}
            />
            <TextInput
              label="Название мелодии"
              value={invite.musicTitle}
              onChange={(value) => updateInvite("musicTitle", value)}
            />
            <TextInput
              label="Или прямая ссылка на аудиофайл"
              value={invite.musicUrl.startsWith("data:") ? "" : invite.musicUrl}
              onChange={(value) => updateInvite("musicUrl", value)}
            />
            <label className={styles.musicUpload}>
              <span>Загрузить свой аудиофайл</span>
              <small>MP3, WAV или OGG для предпросмотра</small>
              <input
                accept="audio/mpeg,audio/ogg,audio/wav,audio/x-wav"
                onChange={(event) => selectMusicFile(event.target.files?.[0])}
                type="file"
              />
            </label>
            {invite.musicUrl.startsWith("data:") ? (
              <p className={styles.musicNote}>
                Загруженный файл используется в предпросмотре. При публикации он будет
                сохранен в S3-хранилище.
              </p>
            ) : null}
            <p className={styles.musicNote}>
              Треки из коллекции доступны по лицензии{" "}
              <a
                href="https://pixabay.com/service/license-summary/"
                rel="noreferrer"
                target="_blank"
              >
                Pixabay Content License
              </a>
              .
            </p>
          </div>
        ) : null}
      </FieldGroup>
    </section>
  );
}
