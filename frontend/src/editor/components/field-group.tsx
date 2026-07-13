import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";

type FieldGroupProps = Readonly<{
  children: ReactNode;
  description?: string;
  hint?: string;
  title: string;
}>;

export function FieldGroup({ children, description, hint, title }: FieldGroupProps) {
  const sectionClass =
    title === "Фото"
      ? " editor-field-group--photos"
      : title === "Палитра"
        ? " editor-field-group--palette"
        : "";

  return (
    <section className={`editor-field-group${sectionClass}`}>
      <div className="editor-field-group__heading">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {hint ? (
          <details className="editor-field-group__help">
            <summary
              aria-label={`Показать подсказку: ${title}`}
              title="Показать подсказку"
            >
              <CircleHelp aria-hidden="true" size={18} strokeWidth={2} />
            </summary>
            <p className="editor-field-group__hint">{hint}</p>
          </details>
        ) : null}
      </div>
      <div className="editor-field-group__body">{children}</div>
    </section>
  );
}
