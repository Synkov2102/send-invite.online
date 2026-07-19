import { TextArea as HeroTextArea } from "@heroui/react";
import styles from "../text-field/text-field.module.css";

type TextAreaFieldProps = Readonly<{
  label: string;
  onChange: (value: string) => void;
  value: string;
}>;

export function TextAreaField({ label, onChange, value }: TextAreaFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <HeroTextArea
        aria-label={label}
        className={`${styles.input} ${styles.textarea}`}
        fullWidth
        onChange={(event) => onChange(event.target.value)}
        value={value}
        variant="secondary"
      />
    </label>
  );
}
