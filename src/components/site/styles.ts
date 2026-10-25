export const btnBase =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-[background-color,box-shadow,color,transform,translate] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/**
 * A keycap: inverted surface with a solid lower lip. Pressing sinks it into the
 * lip instead of scaling, so it feels like a physical key.
 */
export const btnPrimary = `${btnBase} [--lip:var(--color-neutral-600)] dark:[--lip:var(--color-neutral-400)] text-base-950 bg-base-50 ring-1 ring-base-50 inset-shadow-2xs inset-shadow-white/40 shadow-[0_3px_0_var(--lip),0_8px_16px_-6px_var(--color-shade)] hover:bg-base-100 hover:-translate-y-px hover:shadow-[0_4px_0_var(--lip),0_12px_20px_-8px_var(--color-shade)] active:translate-y-[3px] active:shadow-[0_0_0_var(--lip),0_2px_4px_-2px_var(--color-shade)]`;

/** The same key, cut from the surface colour. */
export const btnSecondary = `${btnBase} [--lip:var(--color-neutral-300)] dark:[--lip:var(--color-neutral-950)] text-base-100 bg-base-900 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 shadow-[0_3px_0_var(--lip),0_8px_16px_-8px_var(--color-shade)] hover:bg-base-800 hover:-translate-y-px active:translate-y-[3px] active:shadow-[0_0_0_var(--lip)]`;

export const btnGhost = `${btnBase} text-base-400 hover:text-base-50 hover:bg-base-50/5 active:scale-[0.97]`;
