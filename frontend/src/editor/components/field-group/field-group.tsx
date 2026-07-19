import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./field-group.module.css";

type FieldGroupProps = Readonly<{
  children: ReactNode;
  description?: string;
  hint?: string;
  title: string;
}>;

export function FieldGroup({ children, description, hint, title }: FieldGroupProps) {
  const sectionClass =
    title === "Фото" ? styles.photos : title === "Палитра" ? styles.palette : "";

  return (
    <section className={`${styles.root} ${sectionClass}`.trim()}>
      <div className={styles.heading}>
        <div className={styles.headingCopy}>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {hint ? (
          <details className={styles.help}>
            <summary
              aria-label={`Показать подсказку: ${title}`}
              title="Показать подсказку"
            >
              <CircleHelp aria-hidden="true" size={18} strokeWidth={2} />
            </summary>
            <p className={styles.hint}>{hint}</p>
          </details>
        ) : null}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
