import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./field-group.module.css";

type FieldGroupProps = Readonly<{
  children: ReactNode;
  description?: string;
  hint?: string;
  /** Блок(и) превью, к которому прокрутить при фокусе на группе — см. editor/lib/preview-scroll. */
  previewSection?: string;
  title: string;
}>;

export function FieldGroup({ children, description, hint, previewSection, title }: FieldGroupProps) {
  const sectionClass =
    title === "Фото" ? styles.photos : title === "Палитра" ? styles.palette : "";

  return (
    <section
      className={`${styles.root} ${sectionClass}`.trim()}
      data-preview-section={previewSection}
    >
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
