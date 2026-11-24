import type { Metadata } from "next";
import { Highlight } from "@/components/site/fx";
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
    title: "Turn on class-based dark mode",
    body: "No theme tokens to copy. Components use Tailwind's own palette only: neutral for surfaces and text, blue for the accent, each with a dark: twin. Toggle with a .dark class on <html>.",
    file: "app/globals.css",
    code: `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));`,
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
              Five minutes, <Highlight>once</Highlight>
            </>
          }
          body="Do this once per project. After that every component and block is a straight copy and paste. Assumes React 19 and Tailwind CSS v4."
        />

        <ol className="relative mt-16">
          {steps.map((s, i) => (
            <li key={s.title} className="relative grid gap-5 pb-14 last:pb-0 sm:grid-cols-[4rem_1fr]">
              {/* The rail */}
              {i < steps.length - 1 && <span aria-hidden className="absolute top-8 bottom-0 left-[11px] w-px bg-neutral-950/[0.08] dark:bg-neutral-50/[0.08] max-sm:hidden" />}
              <span className="relative grid size-6 place-items-center rounded-md bg-neutral-100 dark:bg-neutral-900 font-mono text-[11px] text-blue-600 dark:text-blue-500 tabular-nums ring-1 ring-neutral-950/15 dark:ring-neutral-50/15">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.16em] text-neutral-500 uppercase">Step 0{i + 1}</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">{s.title}</h2>
                <p className="mt-2 max-w-2xl leading-7 text-pretty text-neutral-500">{s.body}</p>
                <div className="mt-5 overflow-hidden rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]">
                  <PanelBar label={<span className="tracking-normal normal-case">{s.file}</span>} className="pr-2">
                    <CopyButton value={s.code} />
                  </PanelBar>
                  <pre className="scrollbar-thin max-h-[28rem] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-neutral-700 dark:text-neutral-300">
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
