import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { CopyButton } from "@/components/site/kit/copy-button";
import { PageHeader, PanelBar } from "@/components/site/frame";

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
      <main className="mx-auto w-full max-w-4xl px-6 pt-36 pb-28">
        <PageHeader
          title={
            <>
              Five minutes, <span className="font-serif font-normal tracking-[-0.02em] italic">once.</span>
            </>
          }
          body="Do this once per project. After that every component and block is a straight copy and paste. Assumes React 19 and Tailwind CSS v4."
        />

        <ol className="relative mt-16">
          {steps.map((s, i) => (
            <li key={s.title} className="relative grid gap-5 pb-14 last:pb-0 sm:grid-cols-[4rem_1fr]">
              {/* The rail */}
              {i < steps.length - 1 && <span aria-hidden className="absolute top-8 bottom-0 left-[11px] w-px bg-base-50/[0.08] max-sm:hidden" />}
              <span className="relative grid size-6 place-items-center rounded-[4px] bg-canvas font-mono text-[11px] text-signal tabular-nums ring-1 ring-base-50/15">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.16em] text-base-500 uppercase">Step 0{i + 1}</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-base-50">{s.title}</h2>
                <p className="mt-2 max-w-2xl leading-7 text-pretty text-base-500">{s.body}</p>
                <div className="mt-5 overflow-hidden rounded-lg bg-base-950 ring-1 ring-base-50/[0.08]">
                  <PanelBar label={<span className="tracking-normal normal-case">{s.file}</span>} className="pr-2">
                    <CopyButton value={s.code} />
                  </PanelBar>
                  <pre className="scrollbar-thin max-h-[28rem] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-base-300">
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
