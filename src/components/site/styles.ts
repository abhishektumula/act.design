export const btnBase =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-signal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/** The one accent key: solid signal with a lit top edge. No press movement. */
export const btnPrimary = `${btnBase} bg-signal text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),inset_0_-1px_0_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.25)] hover:bg-[color-mix(in_oklab,var(--signal)_88%,white)]`;

/** A dark key with a hairline ring and a lit top edge. */
export const btnSecondary = `${btnBase} bg-base-900 text-base-50 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--base-50)_8%,transparent)] ring-1 ring-base-50/10 hover:bg-base-800`;

/** A light key: ink on paper, for the second action beside a primary. */
export const btnInk = `${btnBase} bg-base-50 text-base-950 shadow-[inset_0_-1px_0_rgb(0_0_0/0.12)] hover:bg-base-200`;

export const btnGhost = `${btnBase} text-base-400 hover:text-base-50 hover:bg-base-50/5`;

/** A rounded surface with a hairline edge: the site's one card style. */
export const panel = "rounded-2xl bg-base-900/60 ring-1 ring-base-50/[0.06]";

/** A hairline-divided grid: put `bg-base-950` cells inside it. */
export const hairGrid = "grid gap-px overflow-hidden rounded-2xl bg-base-50/[0.08] ring-1 ring-base-50/[0.08]";

/** Inline code in running text. */
export const inlineCode = "rounded-[4px] bg-base-50/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-base-200";
