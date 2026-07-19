"use client";

import { Button } from "@heroui/react";
import { Check, Palette } from "lucide-react";
import { themeFields } from "../../constants";
import { ColorField, FieldGroup } from "../../components";
import panelStyles from "../../components/editor-step-panel/editor-step-panel.module.css";
import { useEditor } from "../../editor-context";
import styles from "./design-step.module.css";

type StepPanelProps = {
  isActive: boolean;
};

export function DesignStep({ isActive }: StepPanelProps) {
  const {
    customPalette,
    customizeSelectedPalette,
    hasRingControls,
    invite,
    palette,
    paletteMode,
    palettes,
    resolvedPaletteId,
    ringColor,
    selectPalette,
    setPaletteMode,
    updateCustomPalette,
    updateInvite,
  } = useEditor();

  return (
    <section className={`${panelStyles.panel} ${isActive ? panelStyles.active : ""}`}>
      <FieldGroup
        title="Палитра"
        description="Выберите готовое настроение или настройте цвета вручную."
        hint="Меняйте цвета ниже — мини-превью сверху обновляется сразу. Для проверки на телефоне откройте «Предпросмотр»."
      >
        <div className={styles.paletteMode} aria-label="Режим настройки палитры">
          <button
            className={paletteMode === "presets" ? styles.isActive : ""}
            onClick={() => setPaletteMode("presets")}
            type="button"
          >
            Готовые
          </button>
          <button
            className={paletteMode === "custom" ? styles.isActive : ""}
            onClick={() => {
              if (resolvedPaletteId !== "custom") {
                customizeSelectedPalette();
                return;
              }

              setPaletteMode("custom");
            }}
            type="button"
          >
            Своя палитра
          </button>
        </div>

        {paletteMode === "presets" ? (
          <div className={styles.paletteGrid}>
            {palettes.map((item) => (
              <Button
                className={`${styles.palette} ${item.id === resolvedPaletteId ? styles.isSelected : ""}`}
                key={item.id}
                onClick={() => selectPalette(item.id)}
                type="button"
                variant="outline"
              >
                <span className={styles.paletteSample}>
                  <span style={{ backgroundColor: item.background }} />
                  <span style={{ backgroundColor: item.surface }} />
                  <span style={{ backgroundColor: item.accent }} />
                  <span style={{ backgroundColor: item.ink }} />
                </span>
                <span className={styles.paletteCopy}>
                  <span>
                    <strong>{item.label}</strong>
                    {item.id === resolvedPaletteId ? <Check aria-hidden size={15} /> : null}
                  </span>
                  <small>{item.mood}</small>
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <div className={styles.colorStudio}>
            <div className={styles.colorStudioHead}>
              <div>
                <p>Своя палитра</p>
                <span>
                  {resolvedPaletteId === "custom"
                    ? customPalette.mood
                    : `Настройте «${palette.label}» под себя`}
                </span>
              </div>
              {resolvedPaletteId !== "custom" ? (
                <Button
                  className={styles.colorStudioStart}
                  onClick={customizeSelectedPalette}
                  type="button"
                  variant="outline"
                >
                  <Palette aria-hidden size={14} />
                  Настроить
                </Button>
              ) : (
                <span className={styles.colorStudioActive}>
                  <Check aria-hidden size={13} />
                  Своя тема
                </span>
              )}
            </div>

            <div
              aria-hidden
              className={styles.colorStudioPreview}
              style={{
                backgroundColor:
                  resolvedPaletteId === "custom" ? customPalette.background : palette.background,
                color: resolvedPaletteId === "custom" ? customPalette.ink : palette.ink,
              }}
            >
              <span
                style={{
                  backgroundColor:
                    resolvedPaletteId === "custom" ? customPalette.surface : palette.surface,
                }}
              >
                <i
                  style={{
                    backgroundColor:
                      resolvedPaletteId === "custom" ? customPalette.accent : palette.accent,
                  }}
                />
                <strong>А & М</strong>
                <small>Сохраните дату</small>
              </span>
            </div>

            <div className={styles.colorFields}>
              {themeFields.map((item) => {
                const value =
                  resolvedPaletteId === "custom" ? customPalette[item.field] : palette[item.field];

                return (
                  <ColorField
                    description={item.description}
                    key={item.field}
                    label={item.label}
                    onChange={(nextValue) => updateCustomPalette(item.field, nextValue)}
                    value={value}
                  />
                );
              })}
            </div>
          </div>
        )}

        {hasRingControls ? (
          <div className={styles.subpanel}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#343a36]">Металл колец</p>
                <p className="text-xs text-[#72786f]">
                  Переведите оттенок от золота к серебру
                </p>
              </div>
              <span
                aria-hidden="true"
                className="h-9 w-9 rounded-full border border-black/10 shadow-inner"
                style={{ backgroundColor: ringColor }}
              />
            </div>
            <label className="grid gap-2 text-sm text-[#53564c]">
              <span className="flex items-center justify-between">
                <span>Золото</span>
                <span>Серебро</span>
              </span>
              <input
                aria-label="Цвет металла колец"
                className={styles.ringSlider}
                max="100"
                min="0"
                onChange={(event) => updateInvite("ringMetal", event.target.value)}
                type="range"
                value={invite.ringMetal}
              />
              <span className="font-mono text-xs uppercase text-[#72786f]">{ringColor}</span>
            </label>
          </div>
        ) : null}
      </FieldGroup>
    </section>
  );
}
