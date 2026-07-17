import styles from "./additional-info-block.module.css";
import { InvitationSectionEyebrow } from "./section-eyebrow";

type AdditionalInfoVariant = "alpine" | "vanilla" | "aqua";

type InvitationAdditionalInfoBlockProps = Readonly<{
  className?: string;
  show?: boolean;
  text: string;
  variant?: AdditionalInfoVariant;
}>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function InvitationAdditionalInfoBlock({
  className,
  show = true,
  text,
  variant = "alpine",
}: InvitationAdditionalInfoBlockProps) {
  const trimmed = text.trim();

  if (!show || !trimmed) {
    return null;
  }

  return (
    <div
      className={cx(
        styles.block,
        variant === "vanilla" ? styles.vanilla : variant === "aqua" ? styles.aqua : styles.alpine,
        className,
      )}
    >
      <InvitationSectionEyebrow>Важно</InvitationSectionEyebrow>
      <h2 className={styles.title}>Дополнительная информация</h2>
      <p className={styles.text}>{trimmed}</p>
    </div>
  );
}
