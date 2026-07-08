"use client";

import { useEffect, useId, useState } from "react";

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
  const [hexDraft, setHexDraft] = useState(value);

  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  return (
    <label className="editor-color-field" htmlFor={inputId}>
      <input
        aria-label={label}
        className="editor-color-field__picker"
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
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
            return;
          }

          setHexDraft(value);
        }}
        onChange={(event) => setHexDraft(event.target.value)}
        spellCheck={false}
        value={hexDraft}
      />
    </label>
  );
}
