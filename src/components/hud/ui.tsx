"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const BASE =
  "pointer-events-auto select-none touch-manipulation rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-sausage text-cream hover:bg-sausage-dark",
  ghost: "bg-ink/10 text-ink hover:bg-ink/20 shadow-none",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
