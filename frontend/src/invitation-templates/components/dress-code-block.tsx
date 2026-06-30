import styles from "./dress-code-block.module.css";
import { InvitationSectionEyebrow } from "./section-eyebrow";

type DressCodeVariant = "alpine" | "vanilla" | "aqua";

type InvitationDressCodeBlockProps = Readonly<{
  className?: string;
  colors: string[];
  text: string;
  variant?: DressCodeVariant;
}>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function InvitationDressCodeBlock({
  className,
  colors,
  text,
  variant = "alpine",
}: InvitationDressCodeBlockProps) {
  return (
    <div
      className={cx(
        styles.block,
        variant === "vanilla" ? styles.vanilla : variant === "aqua" ? styles.aqua : styles.alpine,
        className,
      )}
    >
      <InvitationSectionEyebrow>Dress code</InvitationSectionEyebrow>
      <h2 className={styles.title}>Дресс-код</h2>
      <p className={styles.text}>{text}</p>
      <ul className={styles.swatches} aria-label="Цвета дресс-кода">
        {colors.map((color, index) => (
          <li className={styles.swatchItem} key={`${color}-${index}`}>
            <span
              className={styles.swatch}
              style={{ backgroundColor: color }}
              title={color}
            />
            <span className={styles.swatchLabel}>Цвет {index + 1}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
