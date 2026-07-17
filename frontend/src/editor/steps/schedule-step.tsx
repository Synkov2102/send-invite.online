"use client";

import { Button } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { ColorPicker, FieldGroup, TextAreaField, TextInput } from "../components";
import { useEditor } from "../editor-context";
import styles from "./schedule-step.module.css";

type StepPanelProps = {
  isActive: boolean;
};

export function ScheduleStep({ isActive }: StepPanelProps) {
  const {
    invite,
    addDressCodeColor,
    addScheduleItem,
    removeDressCodeColor,
    removeScheduleItem,
    updateDressCodeColor,
    updateInvite,
    updateScheduleItem,
  } = useEditor();

  return (
    <section className={isActive ? "editor-step-panel is-active" : "editor-step-panel"}>
      <FieldGroup
        title="Расписание"
        description="Добавьте ключевые моменты дня в порядке, как их увидят гости."
        hint="Для мобильного экрана лучше оставить 3-5 событий с короткими названиями."
      >
        <div className="editor-schedule">
          {invite.schedule.map((item, index) => (
            <div className="editor-schedule__item" key={`schedule-${index}`}>
              <div className="editor-schedule__item-head">
                <span>Событие {index + 1}</span>
                <Button
                  aria-label={`Удалить событие ${index + 1}`}
                  className="editor-dress-code__remove"
                  isDisabled={invite.schedule.length <= 1}
                  onClick={() => removeScheduleItem(index)}
                  type="button"
                  variant="outline"
                >
                  <Trash2 aria-hidden size={13} />
                </Button>
              </div>
              <div className="grid grid-cols-[92px_1fr] gap-2">
                <TextInput
                  label="Время"
                  type="time"
                  value={item.time}
                  onChange={(value) => updateScheduleItem(index, "time", value)}
                />
                <TextInput
                  label="Название"
                  value={item.title}
                  onChange={(value) => updateScheduleItem(index, "title", value)}
                />
              </div>
              <TextInput
                label="Описание"
                value={item.description}
                onChange={(value) => updateScheduleItem(index, "description", value)}
              />
            </div>
          ))}
          <Button
            className="editor-schedule__add"
            isDisabled={invite.schedule.length >= 10}
            onClick={addScheduleItem}
            type="button"
            variant="outline"
          >
            <Plus aria-hidden size={14} />
            Добавить событие
          </Button>
        </div>
      </FieldGroup>

      <FieldGroup
        title="Дресс-код"
        description="Опишите пожелания к образам и покажите гостям цветовые ориентиры."
        hint="Палитра в 3-5 оттенков обычно читается лучше, чем длинный набор похожих цветов."
      >
        <TextAreaField
          label="Текст для гостей"
          value={invite.dressCode}
          onChange={(value) => updateInvite("dressCode", value)}
        />
        <div className="editor-dress-code">
          <div className="editor-dress-code__head">
            <div>
              <p>Цвета палитры</p>
              <span>Выберите до восьми оттенков, которые увидят гости</span>
            </div>
            <Button
              className="editor-dress-code__add"
              isDisabled={invite.dressCodeColors.length >= 8}
              onClick={addDressCodeColor}
              type="button"
              variant="outline"
            >
              <Plus aria-hidden size={14} />
              Добавить
            </Button>
          </div>
          <div className={styles.dressCodeColors}>
            {invite.dressCodeColors.map((color, index) => (
              <div className={styles.dressCodeColor} key={`dress-color-${index}`}>
                <ColorPicker
                  ariaLabel={`Выбрать цвет дресс-кода ${index + 1}`}
                  className={styles.dressCodePicker}
                  onChange={(value) => updateDressCodeColor(index, value)}
                  value={color}
                />
                <code>{color}</code>
                <Button
                  aria-label={`Удалить цвет ${index + 1}`}
                  className="editor-dress-code__remove"
                  isDisabled={invite.dressCodeColors.length <= 1}
                  onClick={() => removeDressCodeColor(index)}
                  type="button"
                  variant="outline"
                >
                  <Trash2 aria-hidden size={13} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </FieldGroup>

      <FieldGroup
        title="Общий чат"
        description="Если у гостей есть общий чат в Telegram, WhatsApp или другом мессенджере — добавьте ссылку."
        hint="Блок появится на сайте только после включения. Ссылка должна открываться в браузере."
      >
        <label className="editor-toggle">
          <span>
            <strong>Показать блок «Общий чат»</strong>
            <small>Гости увидят ссылку и короткий текст</small>
          </span>
          <input
            checked={invite.showGroupChat}
            onChange={(event) => updateInvite("showGroupChat", event.target.checked)}
            type="checkbox"
          />
        </label>
        {invite.showGroupChat ? (
          <>
            <TextInput
              label="Ссылка на чат"
              value={invite.groupChatUrl}
              onChange={(value) => updateInvite("groupChatUrl", value)}
            />
            <TextAreaField
              label="Текст для гостей (необязательно)"
              value={invite.groupChatText}
              onChange={(value) => updateInvite("groupChatText", value)}
            />
          </>
        ) : null}
      </FieldGroup>

      <FieldGroup
        title="Дополнительная информация"
        description="Любой абзац, который важно сообщить гостям: трансфер, парковка, подарки и т.п."
        hint="Блок появится на сайте только после включения."
      >
        <label className="editor-toggle">
          <span>
            <strong>Показать блок «Дополнительно»</strong>
            <small>Гости увидят свободный текст с важными деталями</small>
          </span>
          <input
            checked={invite.showAdditionalInfo}
            onChange={(event) => updateInvite("showAdditionalInfo", event.target.checked)}
            type="checkbox"
          />
        </label>
        {invite.showAdditionalInfo ? (
          <TextAreaField
            label="Текст"
            value={invite.additionalInfo}
            onChange={(value) => updateInvite("additionalInfo", value)}
          />
        ) : null}
      </FieldGroup>
    </section>
  );
}
