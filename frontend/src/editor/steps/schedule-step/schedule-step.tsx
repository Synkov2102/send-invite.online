"use client";

import { Button, Input, TextArea } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { ColorPicker, FieldGroup, TextAreaField, TextInput } from "../../components";
import panelStyles from "../../components/editor-step-panel/editor-step-panel.module.css";
import fieldStyles from "../../components/text-field/text-field.module.css";
import toggleStyles from "../../components/editor-toggle/editor-toggle.module.css";
import { useEditor } from "../../editor-context";
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
    <section className={`${panelStyles.panel} ${isActive ? panelStyles.active : ""}`}>
      <FieldGroup
        previewSection="schedule"
        title="Расписание"
        description="Добавьте ключевые моменты дня в порядке, как их увидят гости."
        hint="Блок появится на сайте только после включения."
      >
        <label className={toggleStyles.toggle}>
          <span>
            <strong>Показать блок «Расписание»</strong>
            <small>Гости увидят план дня по времени</small>
          </span>
          <input
            checked={invite.showSchedule}
            onChange={(event) => updateInvite("showSchedule", event.target.checked)}
            type="checkbox"
          />
        </label>
        {invite.showSchedule ? (
          <div className={styles.schedule}>
            <ol className={styles.scheduleList}>
              {invite.schedule.map((item, index) => (
                <li className={styles.scheduleItem} key={`schedule-${index}`}>
                  <label className={styles.scheduleField}>
                    <span className={styles.scheduleLabel}>Время</span>
                    <Input
                      aria-label={`Время события ${index + 1}`}
                      className={`${fieldStyles.input} ${styles.scheduleTime}`}
                      onChange={(event) => updateScheduleItem(index, "time", event.target.value)}
                      type="time"
                      value={item.time}
                      variant="secondary"
                    />
                  </label>
                  <div className={styles.scheduleText}>
                    <label className={styles.scheduleField}>
                      <span className={styles.scheduleLabel}>Название</span>
                      <Input
                        aria-label={`Название события ${index + 1}`}
                        className={`${fieldStyles.input} ${styles.scheduleTitle}`}
                        fullWidth
                        onChange={(event) => updateScheduleItem(index, "title", event.target.value)}
                        placeholder="Например, «Церемония»"
                        value={item.title}
                        variant="secondary"
                      />
                    </label>
                    <label className={styles.scheduleField}>
                      <span className={styles.scheduleLabel}>Описание</span>
                      <TextArea
                        aria-label={`Описание события ${index + 1}`}
                        className={`${fieldStyles.input} ${styles.scheduleDescription}`}
                        fullWidth
                        onChange={(event) =>
                          updateScheduleItem(index, "description", event.target.value)
                        }
                        placeholder="Необязательно"
                        rows={1}
                        value={item.description}
                        variant="secondary"
                      />
                    </label>
                  </div>
                  {invite.schedule.length > 1 ? (
                    <button
                      aria-label={`Удалить событие ${index + 1}`}
                      className={styles.scheduleRemove}
                      onClick={() => removeScheduleItem(index)}
                      type="button"
                    >
                      <Trash2 aria-hidden size={13} />
                      Удалить
                    </button>
                  ) : null}
                </li>
              ))}
            </ol>
            <Button
              className={styles.scheduleAdd}
              isDisabled={invite.schedule.length >= 10}
              onClick={addScheduleItem}
              type="button"
              variant="outline"
            >
              <Plus aria-hidden size={14} />
              Добавить событие
            </Button>
          </div>
        ) : null}
      </FieldGroup>

      <FieldGroup
        previewSection="dress-code"
        title="Дресс-код"
        description="Опишите пожелания к образам и покажите гостям цветовые ориентиры."
        hint="Блок появится на сайте только после включения."
      >
        <label className={toggleStyles.toggle}>
          <span>
            <strong>Показать блок «Дресс-код»</strong>
            <small>Гости увидят текст и цветовую палитру образов</small>
          </span>
          <input
            checked={invite.showDressCode}
            onChange={(event) => updateInvite("showDressCode", event.target.checked)}
            type="checkbox"
          />
        </label>
        {invite.showDressCode ? (
          <>
            <TextAreaField
              label="Текст для гостей"
              value={invite.dressCode}
              onChange={(value) => updateInvite("dressCode", value)}
            />
            <div className={styles.dressCode}>
              <div className={styles.dressCodeHead}>
                <div>
                  <p>Цвета палитры</p>
                  <span>Выберите до восьми оттенков, которые увидят гости</span>
                </div>
                <Button
                  className={styles.dressCodeAdd}
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
                      className={styles.dressCodeRemove}
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
          </>
        ) : null}
      </FieldGroup>

      <FieldGroup
        previewSection="chat"
        title="Общий чат"
        description="Если у гостей есть общий чат в Telegram, WhatsApp или другом мессенджере — добавьте ссылку."
        hint="Блок появится на сайте только после включения. Ссылка должна открываться в браузере."
      >
        <label className={toggleStyles.toggle}>
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
        previewSection="info"
        title="Дополнительная информация"
        description="Любой абзац, который важно сообщить гостям: трансфер, парковка, подарки и т.п."
        hint="Блок появится на сайте только после включения."
      >
        <label className={toggleStyles.toggle}>
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
