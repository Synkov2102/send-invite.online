import type { ReactNode } from "react";

type FieldGroupProps = Readonly<{
  children: ReactNode;
  title: string;
}>;

export function FieldGroup({ children, title }: FieldGroupProps) {
  const sectionClass =
    title === "Фото"
      ? " editor-field-group--photos"
      : title === "Палитра"
        ? " editor-field-group--palette"
        : "";

  return (
    <section className={`editor-field-group${sectionClass}`}>
      <div className="editor-field-group__heading">
        <h2>{title}</h2>
      </div>
      <div className="editor-field-group__body">{children}</div>
    </section>
  );
}
