"use client";

import { ToastQueue } from "@heroui/react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";

/*
 * Своя очередь вместо глобальной `toast`: дефолтная обёртка HeroUI не ловит отказ
 * startViewTransition, и close + add подряд даёт «AbortError: Transition was skipped».
 */
export const editorToastQueue = new ToastQueue({
  wrapUpdate: (fn) => {
    if (!("startViewTransition" in document)) {
      fn();
      return;
    }

    document.startViewTransition(() => flushSync(fn)).ready.catch(() => {});
  },
});

let lastToastKey: string | null = null;

/** Одно уведомление за раз: повторное нажатие заменяет предыдущее, а не копит стопку. */
export function showEditorError(title: ReactNode, description?: ReactNode) {
  if (lastToastKey) {
    editorToastQueue.close(lastToastKey);
  }

  lastToastKey = editorToastQueue.add({ description, title, variant: "danger" }, { timeout: 5000 });
}

export function showStepErrors(stepTitle: string, errors: readonly string[]) {
  showEditorError(
    `Проверьте раздел «${stepTitle}»`,
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>,
  );
}
