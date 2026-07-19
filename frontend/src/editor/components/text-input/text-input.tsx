import { Input } from "@heroui/react";
import styles from "../text-field/text-field.module.css";

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
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <Input
        aria-label={label}
        className={styles.input}
        fullWidth
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
        variant="secondary"
      />
    </label>
  );
}
