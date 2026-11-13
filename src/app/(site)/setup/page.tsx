import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { CopyButton } from "@/components/site/kit/copy-button";

export const metadata: Metadata = { title: "Setup · act.design" };

const steps = [
  {
    title: "Install the shared packages",
    body: "Every component uses Motion for animation, Lucide for icons and a tiny cn helper for class merging.",
    file: "Terminal",
    code: "npm i motion lucide-react clsx tailwind-merge class-variance-authority",
  },
  {
    title: "Add the cn helper",
    body: "Merges conditional classes and lets your className override the defaults cleanly.",
    file: "lib/utils.ts",
    code: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
  },
  {
    title: "Add the theme tokens",
    body: "base-* is a warm graphite scale, flipped for light mode, and signal is the single accent. Components only use these and Tailwind's own palette, so dark and light come for free. Toggle with a .dark class on <html>.",
    file: "app/globals.css",
    code: `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/*
 * Theme tokens — copy this block into your own globals.css.
 * \`base-*\` is a warm graphite scale, flipped for light mode:
 * base-950 is the darkest surface in dark mode and the lightest in light mode.
 * \`signal\` is the single accent: lit ticks, live indicators, primary keys.
 */
@theme inline {
  --color-base-50: var(--base-50);
  --color-base-100: var(--base-100);
  --color-base-200: var(--base-200);
  --color-base-300: var(--base-300);
  --color-base-400: var(--base-400);
  --color-base-500: var(--base-500);
  --color-base-600: var(--base-600);
  --color-base-700: var(--base-700);
  --color-base-800: var(--base-800);
  --color-base-900: var(--base-900);
  --color-base-950: var(--base-950);
  --color-canvas: var(--canvas);
  --color-shade: var(--shade);
  --color-signal: var(--signal);
}

:root {
  color-scheme: light;
  --base-50: oklch(0.2 0.008 70);
  --base-100: oklch(0.26 0.008 70);
  --base-200: oklch(0.33 0.008 70);
  --base-300: oklch(0.42 0.008 70);
  --base-400: oklch(0.51 0.008 70);
  --base-500: oklch(0.6 0.008 70);
  --base-600: oklch(0.69 0.008 75);
  --base-700: oklch(0.8 0.008 75);
  --base-800: oklch(0.875 0.007 80);
  --base-900: oklch(0.93 0.006 80);
  --base-950: oklch(0.985 0.003 85);
  --canvas: oklch(0.962 0.006 85);
  --shade: oklch(0.42 0.03 60);
  --signal: oklch(0.65 0.205 38);
}

.dark {
  color-scheme: dark;
  --base-50: oklch(0.97 0.004 85);
  --base-100: oklch(0.93 0.004 85);
  --base-200: oklch(0.87 0.005 80);
  --base-300: oklch(0.78 0.006 75);
  --base-400: oklch(0.67 0.007 75);
  --base-500: oklch(0.55 0.007 70);
  --base-600: oklch(0.44 0.007 70);
  --base-700: oklch(0.35 0.007 70);
  --base-800: oklch(0.28 0.006 70);
  --base-900: oklch(0.225 0.005 70);
  --base-950: oklch(0.185 0.004 70);
  --canvas: oklch(0.155 0.004 70);
  --shade: oklch(0.06 0.004 70);
  --signal: oklch(0.71 0.19 42);
}`,
  },
  {
    title: "Point the import aliases",
    body: "Components live in components/ui and blocks in components/blocks. The default @/* alias from create-next-app already covers both.",
    file: "tsconfig.json",
    code: `{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}`,
  },
];

export default function SetupPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-6 pt-36 pb-24">
        <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-base-50 sm:text-6xl">
          Five minutes, <span className="font-serif font-normal tracking-[-0.02em] italic">once.</span>
        </h1>
        <p className="mt-5 text-lg leading-8 text-base-400">
          Do this once per project. After that every component and block is a straight copy and paste. Assumes React 19 and
          Tailwind CSS v4.
        </p>

        <ol className="mt-14 space-y-14">
          {steps.map((s, i) => (
            <li key={s.title} className="grid gap-5 sm:grid-cols-[3rem_1fr]">
              <span className="grid size-8 place-items-center rounded-full bg-base-950 text-sm font-medium text-base-200 tabular-nums shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-base-50/10 dark:bg-base-900">
                  {i + 1}
              </span>
              <div className="min-w-0">
                <h2 className="font-serif text-2xl tracking-[-0.01em] text-base-50 italic">{s.title}</h2>
                <p className="mt-1.5 leading-7 text-base-500">{s.body}</p>
                <div className="mt-5 overflow-hidden rounded-[22px] bg-base-950 shadow-[0_1px_0_white_inset,0_24px_48px_-36px_var(--color-shade)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.05)_inset]">
                  <div className="flex h-11 items-center border-b border-base-50/5 pr-2 pl-4">
                    <span className="font-mono text-[13px] text-base-400">{s.file}</span>
                    <CopyButton value={s.code} className="ml-auto" />
                  </div>
                  <pre className="scrollbar-thin max-h-[28rem] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-base-300">
                    {s.code}
                  </pre>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </main>
      <Footer />
    </>
  );
}
