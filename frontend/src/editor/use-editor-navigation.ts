"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { editorStepIds, editorSteps } from "./constants";
import type { getEditorStepErrors } from "./validation";

const leaveEditorMessage =
  "Есть несохраненные изменения. Выйти из редактора без сохранения?";

type UseEditorNavigationArgs = {
  initialIsFullscreenPreview: boolean;
  initialStep: number;
  isPublishing: boolean;
  shouldWarnBeforeLeave: boolean;
  stepErrors: ReturnType<typeof getEditorStepErrors>;
};

export function useEditorNavigation({
  initialIsFullscreenPreview,
  initialStep,
  isPublishing,
  shouldWarnBeforeLeave,
  stepErrors,
}: UseEditorNavigationArgs) {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [visitedSteps, setVisitedSteps] = useState(() => new Set<number>([initialStep]));
  const [visibleValidationStep, setVisibleValidationStep] = useState<number | null>(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(initialIsFullscreenPreview);
  const [isTemplateEntryPreview, setIsTemplateEntryPreview] = useState(initialIsFullscreenPreview);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const hasHistoryGuardRef = useRef(false);
  const ignoreNextPopStateRef = useRef(false);
  const shouldWarnBeforeLeaveRef = useRef(false);
  const activeStepRef = useRef(initialStep);
  const isFullscreenPreviewRef = useRef(initialIsFullscreenPreview);

  function confirmLeaveEditor() {
    if (!shouldWarnBeforeLeave) {
      return true;
    }

    return window.confirm(leaveEditorMessage);
  }

  const updateEditorUrl = useCallback(
    (step: number, preview: boolean, mode: "push" | "replace") => {
      const url = new URL(window.location.href);
      url.searchParams.set("step", editorStepIds[step] ?? editorStepIds[0]);

      if (preview) {
        url.searchParams.set("preview", "1");
      } else {
        url.searchParams.delete("preview");
      }

      window.history[`${mode}State`](
        {
          ...(window.history.state ?? {}),
          editorLeaveGuard: false,
          editorPreviewEntry: preview && mode === "push",
          editorView: true,
        },
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    },
    [],
  );

  function openStep(index: number) {
    if (index !== activeStepRef.current || isFullscreenPreviewRef.current) {
      updateEditorUrl(index, false, "push");
    }

    activeStepRef.current = index;
    isFullscreenPreviewRef.current = false;
    setActiveStep(index);
    setIsFullscreenPreview(false);
    setIsTemplateEntryPreview(false);
    setVisitedSteps((current) => new Set(current).add(index));
    setVisibleValidationStep(null);

    if (window.matchMedia("(max-width: 899px)").matches) {
      window.scrollTo({ top: 0 });
    }
  }

  function goToStepWithErrors(index: number) {
    openStep(index);
    setVisibleValidationStep(index);
  }

  const setFullscreenPreview = useCallback(
    (nextValue: boolean) => {
      if (nextValue === isFullscreenPreviewRef.current) {
        return;
      }

      if (!nextValue) {
        setIsTemplateEntryPreview(false);
      }

      if (!nextValue && window.history.state?.editorPreviewEntry) {
        window.history.back();
        return;
      }

      updateEditorUrl(activeStepRef.current, nextValue, nextValue ? "push" : "replace");
      isFullscreenPreviewRef.current = nextValue;
      setIsFullscreenPreview(nextValue);
    },
    [updateEditorUrl],
  );

  function continueToNextStep() {
    if (stepErrors[activeStep].length > 0) {
      setVisibleValidationStep(activeStep);
      return;
    }

    openStep(Math.min(activeStep + 1, editorSteps.length - 1));
  }

  useEffect(() => {
    shouldWarnBeforeLeaveRef.current = shouldWarnBeforeLeave;
  }, [shouldWarnBeforeLeave]);

  useEffect(() => {
    updateEditorUrl(activeStepRef.current, isFullscreenPreviewRef.current, "replace");
  }, [updateEditorUrl]);

  useEffect(() => {
    if (!shouldWarnBeforeLeave) {
      return;
    }

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, [shouldWarnBeforeLeave]);

  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }

      const url = new URL(window.location.href);

      if (url.pathname === "/editor") {
        if (event.state?.editorLeaveGuard && !shouldWarnBeforeLeaveRef.current) {
          window.history.back();
          return;
        }

        const stepId = url.searchParams.get("step");
        const nextStep = Math.max(0, editorStepIds.findIndex((item) => item === stepId));
        const nextPreview = url.searchParams.get("preview") === "1";
        const didStepChange = nextStep !== activeStepRef.current;

        activeStepRef.current = nextStep;
        isFullscreenPreviewRef.current = nextPreview;
        setActiveStep(nextStep);
        setIsFullscreenPreview(nextPreview);
        if (!nextPreview) {
          setIsTemplateEntryPreview(false);
        }
        setVisitedSteps((current) => new Set(current).add(nextStep));
        setVisibleValidationStep(null);

        if (didStepChange && window.matchMedia("(max-width: 899px)").matches) {
          window.scrollTo({ top: 0 });
        }
        return;
      }

      if (!shouldWarnBeforeLeaveRef.current) {
        return;
      }

      if (window.confirm(leaveEditorMessage)) {
        shouldWarnBeforeLeaveRef.current = false;
        hasHistoryGuardRef.current = false;
        window.history.back();
        return;
      }

      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          editorLeaveGuard: true,
        },
        "",
        window.location.href,
      );
      hasHistoryGuardRef.current = true;
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (shouldWarnBeforeLeave && !hasHistoryGuardRef.current) {
      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          editorLeaveGuard: true,
        },
        "",
        window.location.href,
      );
      hasHistoryGuardRef.current = true;
      return;
    }

    if (!shouldWarnBeforeLeave && hasHistoryGuardRef.current && !isPublishing) {
      hasHistoryGuardRef.current = false;

      if (window.history.state?.editorLeaveGuard) {
        ignoreNextPopStateRef.current = true;
        window.history.back();
      }
    }
  }, [isPublishing, shouldWarnBeforeLeave]);

  useEffect(() => {
    if (!isFullscreenPreview) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFullscreenPreview(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFullscreenPreview, setFullscreenPreview]);

  return {
    activeStep,
    confirmLeaveEditor,
    continueToNextStep,
    goToStepWithErrors,
    isFullscreenPreview,
    isTemplateEntryPreview,
    openStep,
    previewDevice,
    setFullscreenPreview,
    setPreviewDevice,
    visibleValidationStep,
    visitedSteps,
  };
}
