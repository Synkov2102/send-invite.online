"use client";

import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import type { WaterBackgroundProps } from "./water-background.types";

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
    const frameId = window.requestAnimationFrame(() => {
      void import("./water-background-renderer").then((module) => {
        if (!cancelled) {
          setRenderer(() => module.WaterBackgroundRenderer);
        }
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
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
