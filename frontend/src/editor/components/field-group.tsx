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
      </div>
      {hint ? <p className="editor-field-group__hint">{hint}</p> : null}
      <div className="editor-field-group__body">{children}</div>
    </section>
  );
}
