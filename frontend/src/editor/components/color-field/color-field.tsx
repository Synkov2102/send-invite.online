"use client";

import { useState } from "react";
import { ColorPicker } from "../color-picker";
import styles from "./color-field.module.css";

type ColorFieldProps = {
  description: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : null;
}

export function ColorField({ description, label, onChange, value }: ColorFieldProps) {
  const [isHexFocused, setIsHexFocused] = useState(false);
  const [hexDraft, setHexDraft] = useState(value);

  return (
    <div className={styles.root}>
      <ColorPicker
        ariaLabel={`Выбрать цвет: ${label}`}
        className={styles.picker}
        onChange={onChange}
        value={value}
      />
      <span className={styles.copy}>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        aria-label={`${label}, hex-код`}
        className={styles.hex}
        inputMode="text"
        onBlur={() => {
          const next = normalizeHex(hexDraft);
          if (next) {
            onChange(next);
            setHexDraft(next);
          } else {
            setHexDraft(value);
          }

          setIsHexFocused(false);
        }}
        onChange={(event) => setHexDraft(event.target.value)}
        onFocus={() => {
          setHexDraft(value);
          setIsHexFocused(true);
        }}
        spellCheck={false}
        value={isHexFocused ? hexDraft : value}
      />
    </div>
  );
}
