"use client";

import { Button } from "@heroui/react";
import { Check, Palette } from "lucide-react";
import { themeFields } from "../constants";
import { ColorField, FieldGroup } from "../components";
import { useEditor } from "../editor-context";

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
    <section className={isActive ? "editor-step-panel is-active" : "editor-step-panel"}>
      <FieldGroup
        title="Палитра"
        description="Выберите готовое настроение или настройте цвета вручную."
        hint="Меняйте цвета ниже — мини-превью сверху обновляется сразу. Для проверки на телефоне откройте «Предпросмотр»."
      >
        <div className="editor-palette-mode" aria-label="Режим настройки палитры">
          <button
            className={paletteMode === "presets" ? "is-active" : ""}
            onClick={() => setPaletteMode("presets")}
            type="button"
          >
            Готовые
          </button>
          <button
            className={paletteMode === "custom" ? "is-active" : ""}
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
          <div className="editor-palette-grid">
            {palettes.map((item) => (
              <Button
                className={`editor-palette ${item.id === resolvedPaletteId ? "is-selected" : ""}`}
                key={item.id}
                onClick={() => selectPalette(item.id)}
                type="button"
                variant="outline"
              >
                <span className="editor-palette__sample">
                  <span style={{ backgroundColor: item.background }} />
                  <span style={{ backgroundColor: item.surface }} />
                  <span style={{ backgroundColor: item.accent }} />
                  <span style={{ backgroundColor: item.ink }} />
                </span>
                <span className="editor-palette__copy">
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
          <div className="editor-color-studio">
            <div className="editor-color-studio__head">
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
                  className="editor-color-studio__start"
                  onClick={customizeSelectedPalette}
                  type="button"
                  variant="outline"
                >
                  <Palette aria-hidden size={14} />
                  Настроить
                </Button>
              ) : (
                <span className="editor-color-studio__active">
                  <Check aria-hidden size={13} />
                  Своя тема
                </span>
              )}
            </div>

            <div
              aria-hidden
              className="editor-color-studio__preview"
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

            <div className="editor-color-fields">
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
          <div className="editor-subpanel">
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
                className="editor-ring-slider"
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
