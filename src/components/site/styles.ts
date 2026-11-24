export const btnBase =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 dark:focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black";

/** The one accent key: solid signal with a lit top edge. No press movement. */
export const btnPrimary = `${btnBase} bg-blue-600 dark:bg-blue-500 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),inset_0_-1px_0_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.25)] hover:bg-[color-mix(in_oklab,var(--color-blue-600)_88%,white)] dark:hover:bg-[color-mix(in_oklab,var(--color-blue-500)_88%,white)]`;

/** A dark key with a hairline ring and a lit top edge. */
export const btnSecondary = `${btnBase} bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-neutral-950)_8%,transparent)] dark:shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-neutral-50)_8%,transparent)] ring-1 ring-neutral-950/10 dark:ring-neutral-50/10 hover:bg-neutral-200 dark:hover:bg-neutral-800`;

/** A light key: ink on paper, for the second action beside a primary. */
export const btnInk = `${btnBase} bg-neutral-950 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-950 shadow-[inset_0_-1px_0_rgb(0_0_0/0.12)] hover:bg-neutral-800 dark:hover:bg-neutral-200`;

export const btnGhost = `${btnBase} text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 hover:bg-neutral-950/5 dark:hover:bg-neutral-50/5`;

/** A rounded surface with a hairline edge: the site's one card style. */
export const panel = "rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]";

/** A hairline-divided grid: put `bg-neutral-50 dark:bg-neutral-950` cells inside it. */
export const hairGrid = "grid gap-px overflow-hidden rounded-2xl bg-neutral-950/[0.08] dark:bg-neutral-50/[0.08] ring-1 ring-neutral-950/[0.08] dark:ring-neutral-50/[0.08]";

/** Inline code in running text. */
export const inlineCode = "rounded-[4px] bg-neutral-950/[0.06] dark:bg-neutral-50/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-800 dark:text-neutral-200";
