"use client";

import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import type { WaterBackgroundProps } from "./water-background.types";

const STATIC_BACKGROUND_QUERY = "(max-width: 640px), (prefers-reduced-motion: reduce)";

function waterGradientStyle(deep: string, shallow: string): CSSProperties {
  return { background: `linear-gradient(160deg, ${deep}, ${shallow})` };
}

export default function WaterBackground({
  className,
  deep,
  shallow,
  foam,
}: WaterBackgroundProps) {
  const [Renderer, setRenderer] =
    useState<ComponentType<WaterBackgroundProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let frameId: number | null = null;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    const staticBackground = window.matchMedia(STATIC_BACKGROUND_QUERY);

    const cancelScheduledLoad = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }

      if (idleId !== null) {
        window.cancelIdleCallback(idleId);
        idleId = null;
      }

      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const loadRenderer = () => {
      void import("./water-background-renderer").then((module) => {
        if (!cancelled && !staticBackground.matches) {
          setRenderer(() => module.WaterBackgroundRenderer);
        }
      });
    };

    const updateRenderer = () => {
      cancelScheduledLoad();

      if (staticBackground.matches) {
        setRenderer(null);
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;

        if ("requestIdleCallback" in window) {
          idleId = window.requestIdleCallback(
            () => {
              idleId = null;
              loadRenderer();
            },
            { timeout: 1200 },
          );
          return;
        }

        timeoutId = globalThis.setTimeout(() => {
          timeoutId = null;
          loadRenderer();
        }, 350);
      });
    };

    updateRenderer();
    staticBackground.addEventListener("change", updateRenderer);

    return () => {
      cancelled = true;
      staticBackground.removeEventListener("change", updateRenderer);
      cancelScheduledLoad();
    };
  }, []);

  if (Renderer) {
    return <Renderer className={className} deep={deep} foam={foam} shallow={shallow} />;
  }

  return (
    <canvas
      aria-hidden
      className={className}
      style={waterGradientStyle(deep, shallow)}
    />
  );
}
