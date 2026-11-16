export const btnBase =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-signal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/** Solid ink button with a minimal shadow. No press movement. */
export const btnPrimary = `${btnBase} bg-base-50 text-base-950 shadow-[0_1px_2px_rgb(0_0_0/0.14)] hover:bg-base-200`;

/** Surface button with a hairline ring. */
export const btnSecondary = `${btnBase} bg-base-950 text-base-100 shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-base-50/10 hover:bg-base-900 dark:bg-base-900 dark:hover:bg-base-800`;

export const btnGhost = `${btnBase} text-base-400 hover:text-base-50 hover:bg-base-50/5`;

/** A flat surface with a hairline edge: the site's one card style. */
export const panel = "rounded-lg bg-base-950 ring-1 ring-base-50/[0.08]";

/** A hairline-divided grid: put `bg-base-950` cells inside it. */
export const hairGrid = "grid gap-px bg-base-50/[0.08] ring-1 ring-base-50/[0.08]";

/** Inline code in running text. */
export const inlineCode = "rounded-[4px] bg-base-50/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-base-200";
