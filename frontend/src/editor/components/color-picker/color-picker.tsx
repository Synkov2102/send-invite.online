"use client";

import { HexColorInput, HexColorPicker } from "react-colorful";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./color-picker.module.css";

type ColorPickerProps = {
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
  value: string;
};

function normalizeHex(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : null;
}

export function ColorPicker({ ariaLabel, className, onChange, value }: ColorPickerProps) {
  const dialogId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const normalizedValue = normalizeHex(value) ?? "#000000";

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root} ref={rootRef}>
      <button
        aria-controls={isOpen ? dialogId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        className={styles.trigger}
        onClick={() => setIsOpen((current) => !current)}
        style={{ backgroundColor: normalizedValue }}
        type="button"
      />
      {isOpen ? (
        <div
          aria-label={ariaLabel}
          className={styles.popover}
          id={dialogId}
          role="dialog"
        >
          <HexColorPicker
            aria-label={ariaLabel}
            className={styles.control}
            color={normalizedValue}
            onChange={onChange}
          />
          <label className={styles.hex}>
            <span style={{ backgroundColor: normalizedValue }} />
            <HexColorInput
              aria-label="HEX-код цвета"
              color={normalizedValue}
              onChange={onChange}
              prefixed
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
