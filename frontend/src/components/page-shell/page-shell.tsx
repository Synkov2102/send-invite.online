"use client";

import { createContext, useContext, type ComponentPropsWithoutRef, type ElementType } from "react";
import styles from "./page-shell.module.css";

export type PageShellWidth = "narrow" | "wide";

const PageShellContext = createContext<PageShellWidth | null>(null);

/** Nested shells (e.g. a card inside a wide section) can read the ambient width instead of guessing it. */
export function usePageShellWidth() {
  const width = useContext(PageShellContext);

  if (!width) {
    throw new Error("usePageShellWidth must be used within PageShellProvider");
  }

  return width;
}

type PageShellProviderProps<T extends ElementType> = {
  as?: T;
  width: PageShellWidth;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "width">;

/**
 * Single source of truth for the site's two content-column widths: `wide` for grids and cards
 * (home sections, /templates, /blog listing, dashboard), `narrow` for reading text (legal pages,
 * a blog article). Renders the sized element itself — callers keep their own class for padding,
 * grid layout and other page-specific styling.
 */
export default function PageShellProvider<T extends ElementType = "div">({
  as,
  width,
  className,
  children,
  ...props
}: PageShellProviderProps<T>) {
  const Element = (as ?? "div") as ElementType;
  const widthClass = width === "wide" ? styles.wide : styles.narrow;

  return (
    <PageShellContext.Provider value={width}>
      <Element className={className ? `${widthClass} ${className}` : widthClass} {...props}>
        {children}
      </Element>
    </PageShellContext.Provider>
  );
}
