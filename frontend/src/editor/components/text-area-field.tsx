import { TextArea as HeroTextArea } from "@heroui/react";

type TextAreaFieldProps = Readonly<{
  label: string;
  onChange: (value: string) => void;
  value: string;
}>;

export function TextAreaField({ label, onChange, value }: TextAreaFieldProps) {
  return (
    <label className="editor-field">
      <span className="editor-field__label">{label}</span>
      <HeroTextArea
        aria-label={label}
        className="editor-field__input editor-field__textarea"
        fullWidth
        onChange={(event) => onChange(event.target.value)}
        value={value}
        variant="secondary"
      />
    </label>
  );
}
