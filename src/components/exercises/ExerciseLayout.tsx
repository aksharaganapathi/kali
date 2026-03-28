"use client";

/**
 * Shared layout wrapper used by every exercise.
 * Replaces the old fixed `h-[400px]` pattern with a fluid, gap-based column.
 */

interface ExerciseLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ExerciseLayout({ children, className = "" }: ExerciseLayoutProps) {
  return (
    <div
      className={`w-full flex flex-col items-center gap-6 py-4 min-h-[360px] ${className}`}
    >
      {children}
    </div>
  );
}
