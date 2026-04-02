"use client";

import { CSSProperties, HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";

interface CenteredGlyphProps extends HTMLAttributes<HTMLSpanElement> {
  glyph: string;
}

interface Offset {
  x: number;
  y: number;
}

const OPTICAL_UPWARD_BIAS_PX = 0.85;

let sharedCanvas: HTMLCanvasElement | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!sharedCanvas) {
    sharedCanvas = document.createElement("canvas");
  }
  return sharedCanvas.getContext("2d");
}

export default function CenteredGlyph({ glyph, className = "", style, ...rest }: CenteredGlyphProps) {
  const glyphRef = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

  const fontStyleDeps = useMemo(
    () => ({
      className,
      fontFamily: style?.fontFamily,
      fontSize: style?.fontSize,
      fontWeight: style?.fontWeight,
      fontStyle: style?.fontStyle,
      lineHeight: style?.lineHeight,
      letterSpacing: style?.letterSpacing,
    }),
    [className, style?.fontFamily, style?.fontSize, style?.fontWeight, style?.fontStyle, style?.lineHeight, style?.letterSpacing]
  );

  useEffect(() => {
    const measure = () => {
      const el = glyphRef.current;
      const ctx = getMeasureContext();

      if (!el || !ctx || !glyph) {
        setOffset({ x: 0, y: 0 });
        return;
      }

      const computed = window.getComputedStyle(el);
      if (!computed.font) {
        setOffset({ x: 0, y: 0 });
        return;
      }

      ctx.font = computed.font;
      const metrics = ctx.measureText(glyph);

      const hasMetrics =
        typeof metrics.actualBoundingBoxLeft === "number" &&
        typeof metrics.actualBoundingBoxRight === "number" &&
        typeof metrics.actualBoundingBoxAscent === "number" &&
        typeof metrics.actualBoundingBoxDescent === "number";

      if (!hasMetrics) {
        setOffset({ x: 0, y: 0 });
        return;
      }

      // Align ink center to the text run center. This avoids large over-shifts
      // that happen when treating the baseline origin as the visual center.
      const inkCenterX = (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2;
      const advanceCenterX = metrics.width / 2;
      const nextX = advanceCenterX - inkCenterX;

      const fontAscent =
        typeof metrics.fontBoundingBoxAscent === "number"
          ? metrics.fontBoundingBoxAscent
          : typeof metrics.emHeightAscent === "number"
          ? metrics.emHeightAscent
          : metrics.actualBoundingBoxAscent;

      const fontDescent =
        typeof metrics.fontBoundingBoxDescent === "number"
          ? metrics.fontBoundingBoxDescent
          : typeof metrics.emHeightDescent === "number"
          ? metrics.emHeightDescent
          : metrics.actualBoundingBoxDescent;

      const inkCenterY = (metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent) / 2;
      const fontCenterY = (fontDescent - fontAscent) / 2;
      const nextY = fontCenterY - inkCenterY - OPTICAL_UPWARD_BIAS_PX;

      setOffset((prev) => {
        if (Math.abs(prev.x - nextX) < 0.01 && Math.abs(prev.y - nextY) < 0.01) {
          return prev;
        }
        return { x: nextX, y: nextY };
      });
    };

    measure();
    window.addEventListener("resize", measure);

    let cancelled = false;
    if ("fonts" in document) {
      void (document.fonts as FontFaceSet).ready.then(() => {
        if (!cancelled) {
          measure();
        }
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [glyph, fontStyleDeps]);

  const mergedStyle: CSSProperties = {
    ...style,
    transform: `${style?.transform ? `${style.transform} ` : ""}translate(${offset.x}px, ${offset.y}px)`,
    transformOrigin: style?.transformOrigin ?? "center",
  };

  return (
    <span ref={glyphRef} className={className} style={mergedStyle} {...rest}>
      {glyph}
    </span>
  );
}