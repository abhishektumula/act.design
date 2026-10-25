import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { CopyButton } from "@/components/site/kit/copy-button";

export const metadata: Metadata = { title: "Setup · Tasteful UI" };

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
    body: "base-* is Tailwind's neutral scale, flipped for light mode. Components only use these and Tailwind's own palette, so dark and light come for free. Toggle with a .dark class on <html>.",
    file: "app/globals.css",
    code: `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/*
 * Theme tokens — copy this block into your own globals.css.
 * \`base-*\` is Tailwind's neutral scale, flipped for light mode:
 * base-950 is the darkest surface in dark mode and the lightest in light mode.
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
}

:root {
  color-scheme: light;
  --base-50: var(--color-neutral-950);
  --base-100: var(--color-neutral-900);
  --base-200: var(--color-neutral-800);
  --base-300: var(--color-neutral-700);
  --base-400: var(--color-neutral-600);
  --base-500: var(--color-neutral-500);
  --base-600: var(--color-neutral-400);
  --base-700: var(--color-neutral-300);
  --base-800: var(--color-neutral-200);
  --base-900: var(--color-neutral-100);
  --base-950: var(--color-neutral-50);
  --canvas: var(--color-white);
  --shade: var(--color-neutral-400);
}

.dark {
  color-scheme: dark;
  --base-50: var(--color-neutral-50);
  --base-100: var(--color-neutral-100);
  --base-200: var(--color-neutral-200);
  --base-300: var(--color-neutral-300);
  --base-400: var(--color-neutral-400);
  --base-500: var(--color-neutral-500);
  --base-600: var(--color-neutral-600);
  --base-700: var(--color-neutral-700);
  --base-800: var(--color-neutral-800);
  --base-900: var(--color-neutral-900);
  --base-950: var(--color-neutral-950);
  --canvas: var(--color-black);
  --shade: var(--color-black);
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
      <main className="mx-auto w-full max-w-3xl px-6 pt-28 pb-24">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Setup</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-base-50 sm:text-5xl">Five minutes, once.</h1>
        <p className="mt-5 text-lg leading-8 text-base-400">
          Do this once per project. After that every component and block is a straight copy and paste. Assumes React 19 and
          Tailwind CSS v4.
        </p>

        <ol className="mt-14 space-y-14">
          {steps.map((s, i) => (
            <li key={s.title} className="grid gap-5 sm:grid-cols-[2.5rem_1fr]">
              <span className="grid size-8 place-items-center rounded-full bg-base-900 text-sm text-base-300 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10 tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-medium text-base-100">{s.title}</h2>
                <p className="mt-1.5 leading-7 text-base-500">{s.body}</p>
                <div className="mt-5 overflow-hidden rounded-2xl bg-base-950 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5">
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
