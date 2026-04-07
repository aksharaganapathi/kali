"use client";

import { CSSProperties } from "react";
import CenteredGlyph from "./CenteredGlyph";

interface GlyphStageProps {
  glyph: string;
  children?: React.ReactNode;
  className?: string;
  glyphClassName?: string;
  style?: CSSProperties;
  glyphStyle?: CSSProperties;
}

function getStageMetrics(glyph: string) {
  const graphemeCount = Array.from(glyph.trim()).length || 1;

  if (graphemeCount >= 3) {
    return {
      stageStyle: {
        width: "min(19rem, 92vw)",
        minHeight: "11rem",
        paddingInline: "1.5rem",
      } satisfies CSSProperties,
      glyphStyle: {
        fontSize: "4rem",
        lineHeight: 1,
      } satisfies CSSProperties,
    };
  }

  if (graphemeCount === 2) {
    return {
      stageStyle: {
        width: "11.5rem",
        minHeight: "11rem",
        paddingInline: "1.25rem",
      } satisfies CSSProperties,
      glyphStyle: {
        fontSize: "4.5rem",
        lineHeight: 1,
      } satisfies CSSProperties,
    };
  }

  return {
    stageStyle: {
      width: "10rem",
      height: "10rem",
      paddingInline: "1rem",
    } satisfies CSSProperties,
    glyphStyle: {
      fontSize: "5rem",
      lineHeight: 1,
    } satisfies CSSProperties,
  };
}

export default function GlyphStage({
  glyph,
  children,
  className = "",
  glyphClassName = "",
  style,
  glyphStyle,
}: GlyphStageProps) {
  const { stageStyle, glyphStyle: computedGlyphStyle } = getStageMetrics(glyph);

  return (
    <div
      className={`relative flex items-center justify-center rounded-3xl ${className}`}
      style={{ ...stageStyle, ...style }}
    >
      <CenteredGlyph
        glyph={glyph}
        className={glyphClassName}
        style={{ ...computedGlyphStyle, ...glyphStyle }}
      />
      {children}
    </div>
  );
}
