"use client";

import { Button } from "@heroui/react";
import { ArrowRight, ChevronLeft, Sparkles } from "lucide-react";
import { formatInviteSitePrice } from "@/lib/commerce";
import { editorSteps } from "../constants";
import { useEditor } from "../editor-context";

export function EditorStepActions() {
  const {
    acceptedPurchaseTerms,
    activeStep,
    allErrors,
    continueToNextStep,
    isPublishing,
    openStep,
    publishError,
    publishSite,
    requiresPayment,
    visibleValidationStep,
    stepErrors,
  } = useEditor();

  return (
    <>
      {visibleValidationStep === activeStep && stepErrors[activeStep].length > 0 ? (
        <div className="editor-validation-summary" role="alert">
          <strong>Проверьте этот раздел</strong>
          <ul>
            {stepErrors[activeStep].map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {publishError && activeStep === editorSteps.length - 1 ? (
        <p className="editor-publish-error" role="alert">
          {publishError}
        </p>
      ) : null}

      <div className="editor-step-actions">
        <Button
          className="editor-step-actions__back"
          isDisabled={activeStep === 0}
          onClick={() => openStep(Math.max(0, activeStep - 1))}
          type="button"
          variant="outline"
        >
          <ChevronLeft aria-hidden size={16} />
          <span>Предыдущий</span>
        </Button>
        {activeStep < editorSteps.length - 1 ? (
          <Button
            className="editor-step-actions__next"
            onClick={continueToNextStep}
            type="button"
            variant="primary"
          >
            Следующий
            <ArrowRight aria-hidden size={16} />
          </Button>
        ) : (
          <Button
            className="editor-step-actions__next"
            isDisabled={
              isPublishing ||
              allErrors.length > 0 ||
              (requiresPayment && !acceptedPurchaseTerms)
            }
            onClick={publishSite}
            type="button"
            variant="primary"
          >
            {isPublishing
              ? requiresPayment
                ? "Переходим к оплате"
                : "Сохраняем"
              : requiresPayment
                ? `Оплатить ${formatInviteSitePrice()}`
                : "Сохранить изменения"}
            <Sparkles aria-hidden size={16} />
          </Button>
        )}
      </div>
    </>
  );
}
