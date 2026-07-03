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
    const staticBackground = window.matchMedia(STATIC_BACKGROUND_QUERY);

    const updateRenderer = () => {
      if (staticBackground.matches) {
        setRenderer(null);
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        void import("./water-background-renderer").then((module) => {
          if (!cancelled && !staticBackground.matches) {
            setRenderer(() => module.WaterBackgroundRenderer);
          }
        });
      });
    };

    updateRenderer();
    staticBackground.addEventListener("change", updateRenderer);

    return () => {
      cancelled = true;
      staticBackground.removeEventListener("change", updateRenderer);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
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
