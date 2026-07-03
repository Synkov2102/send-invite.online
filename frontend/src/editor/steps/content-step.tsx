"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { getYandexMapsUrl } from "@/lib/invite-map";
import { FieldGroup, TextAreaField, TextInput } from "../components";
import { useEditor } from "../editor-context";

type StepPanelProps = {
  isActive: boolean;
};

export function ContentStep({ isActive }: StepPanelProps) {
  const { invite, updateInvite } = useEditor();

  return (
    <section className={isActive ? "editor-step-panel is-active" : "editor-step-panel"}>
      <FieldGroup title="Пара">
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            label="Жених"
            value={invite.groom}
            onChange={(value) => updateInvite("groom", value)}
          />
          <TextInput
            label="Невеста"
            value={invite.bride}
            onChange={(value) => updateInvite("bride", value)}
          />
        </div>
        <TextAreaField
          label="Текст приглашения"
          value={invite.lead}
          onChange={(value) => updateInvite("lead", value)}
        />
      </FieldGroup>

      <FieldGroup title="Событие">
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            label="Дата"
            type="date"
            value={invite.date}
            onChange={(value) => updateInvite("date", value)}
          />
          <TextInput
            label="Время"
            type="time"
            value={invite.time}
            onChange={(value) => updateInvite("time", value)}
          />
        </div>
        <TextInput
          label="Город"
          value={invite.city}
          onChange={(value) => updateInvite("city", value)}
        />
        <TextInput
          label="Площадка"
          value={invite.venue}
          onChange={(value) => updateInvite("venue", value)}
        />
        <TextInput
          label="Адрес"
          value={invite.address}
          onChange={(value) => updateInvite("address", value)}
        />
        <div className="editor-map-field">
          <div className="editor-map-field__heading">
            <MapPin aria-hidden size={17} />
            <div>
              <strong>Точка на Яндекс Картах</strong>
              <span>Необязательно</span>
            </div>
          </div>
          <TextInput
            label="Ссылка на место"
            value={invite.mapUrl ?? ""}
            onChange={(value) => updateInvite("mapUrl", value)}
          />
          <p>
            Откройте место в Яндекс Картах, нажмите «Поделиться» и вставьте
            полученную ссылку.
          </p>
          {getYandexMapsUrl(invite.mapUrl) ? (
            <a
              href={getYandexMapsUrl(invite.mapUrl) ?? undefined}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden size={14} />
              Проверить точку
            </a>
          ) : null}
        </div>
      </FieldGroup>
    </section>
  );
}
