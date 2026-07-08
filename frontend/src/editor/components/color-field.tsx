"use client";

import { useId, useState } from "react";

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
  const inputId = useId();
  const [isHexFocused, setIsHexFocused] = useState(false);
  const [hexDraft, setHexDraft] = useState(value);

  return (
    <label className="editor-color-field" htmlFor={inputId}>
      <input
        aria-label={label}
        className="editor-color-field__picker"
        id={inputId}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next);
          if (!isHexFocused) {
            setHexDraft(next);
          }
        }}
        type="color"
        value={value}
      />
      <span className="editor-color-field__copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        aria-label={`${label}, hex-код`}
        className="editor-color-field__hex"
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
    </label>
  );
}
