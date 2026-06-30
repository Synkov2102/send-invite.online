import { Input } from "@heroui/react";

type TextInputProps = Readonly<{
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}>;

export function TextInput({
  label,
  onChange,
  type = "text",
  value,
}: TextInputProps) {
  return (
    <label className="editor-field">
      <span className="editor-field__label">{label}</span>
      <Input
        aria-label={label}
        className="editor-field__input"
        fullWidth
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
        variant="secondary"
      />
    </label>
  );
}
