"use client";

import { Button } from "@heroui/react";
import { ArrowRight, ChevronLeft, Maximize2, Sparkles } from "lucide-react";
import { formatRubPriceLabel } from "@/lib/commerce";
import { editorSteps } from "../../constants";
import { useEditor } from "../../editor-context";
import styles from "./editor-step-actions.module.css";

export function EditorStepActions() {
  const {
    activeStep,
    checkoutPricing,
    continueToNextStep,
    isPublishing,
    openStep,
    publishError,
    publishSite,
    requiresPayment,
    setIsFullscreenPreview,
  } = useEditor();
  const isFreeCheckout = requiresPayment && Number(checkoutPricing.amount) <= 0;

  return (
    <>
      {publishError && activeStep === editorSteps.length - 1 ? (
        <p className={styles.publishError} role="alert">
          {publishError}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button
          className={styles.back}
          isDisabled={activeStep === 0}
          onClick={() => openStep(Math.max(0, activeStep - 1))}
          type="button"
          variant="outline"
        >
          <ChevronLeft aria-hidden size={16} />
          <span>Предыдущий</span>
        </Button>
        <Button
          aria-label="Открыть предпросмотр на весь экран"
          className={styles.preview}
          onClick={() => setIsFullscreenPreview(true)}
          type="button"
          variant="outline"
        >
          <Maximize2 aria-hidden size={15} />
          Просмотр
        </Button>
        {activeStep < editorSteps.length - 1 ? (
          <Button
            className={styles.next}
            onClick={continueToNextStep}
            type="button"
            variant="primary"
          >
            Следующий
            <ArrowRight aria-hidden size={16} />
          </Button>
        ) : (
          <Button
            className={styles.next}
            isDisabled={isPublishing}
            onClick={publishSite}
            type="button"
            variant="primary"
          >
            {isPublishing
              ? requiresPayment
                ? isFreeCheckout
                  ? "Публикуем"
                  : "Переходим к оплате"
                : "Сохраняем"
              : requiresPayment
                ? isFreeCheckout
                  ? "Опубликовать бесплатно"
                  : `Оплатить ${formatRubPriceLabel(checkoutPricing.amount)}`
                : "Сохранить изменения"}
            <Sparkles aria-hidden size={16} />
          </Button>
        )}
      </div>
    </>
  );
}
