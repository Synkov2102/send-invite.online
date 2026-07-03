"use client";

import { Button } from "@heroui/react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { imageUploadTypes } from "../constants";
import { FieldGroup, TextInput } from "../components";
import { useEditor } from "../editor-context";

type StepPanelProps = {
  isActive: boolean;
};

export function MediaStep({ isActive }: StepPanelProps) {
  const {
    coverImage,
    invite,
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
    <section className={isActive ? "editor-step-panel is-active" : "editor-step-panel"}>
      <FieldGroup title="Фото">
        <div className="editor-photo-grid">
          {photoSlots.map((item) => (
            <div className="editor-photo-upload" key={item.field}>
              <div
                aria-hidden
                className="editor-photo-upload__preview"
                style={{ backgroundImage: `url(${item.src})` }}
              />
              <div className="editor-photo-upload__copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </div>
              <div className="editor-photo-upload__actions">
                <label className="editor-photo-upload__button">
                  <ImagePlus aria-hidden size={14} />
                  <span>Загрузить</span>
                  <input
                    accept={imageUploadTypes.join(",")}
                    onChange={(event) => {
                      selectImageFile(item.field, event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                    type="file"
                  />
                </label>
                <Button
                  aria-label={`Сбросить ${item.label.toLowerCase()}`}
                  className="editor-photo-upload__reset"
                  isDisabled={!invite[item.field]}
                  onClick={() => resetImage(item.field)}
                  type="button"
                  variant="outline"
                >
                  <RotateCcw aria-hidden size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {photoError ? (
          <p className="editor-photo-error" role="alert">
            {photoError}
          </p>
        ) : null}
        <p className="editor-music-note">
          JPG, PNG, WEBP или GIF до 8 МБ. При публикации фото будут сохранены в
          S3-хранилище.
        </p>
      </FieldGroup>

      <FieldGroup title="Музыка">
        <label className="editor-toggle">
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
          <div className="editor-music-settings">
            <TextInput
              label="Название мелодии"
              value={invite.musicTitle}
              onChange={(value) => updateInvite("musicTitle", value)}
            />
            <TextInput
              label="Прямая ссылка на аудиофайл"
              value={invite.musicUrl.startsWith("data:") ? "" : invite.musicUrl}
              onChange={(value) => updateInvite("musicUrl", value)}
            />
            <label className="editor-music-upload">
              <span>Загрузить свой аудиофайл</span>
              <small>MP3, WAV или OGG для предпросмотра</small>
              <input
                accept="audio/mpeg,audio/ogg,audio/wav,audio/x-wav"
                onChange={(event) => selectMusicFile(event.target.files?.[0])}
                type="file"
              />
            </label>
            {invite.musicUrl.startsWith("data:") ? (
              <p className="editor-music-note">
                Загруженный файл используется в предпросмотре. При публикации он будет
                сохранен в S3-хранилище.
              </p>
            ) : null}
          </div>
        ) : null}
      </FieldGroup>
    </section>
  );
}
