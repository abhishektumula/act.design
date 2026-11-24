import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Headline and lede for the top of a page. */
export function PageHeader({
  title,
  body,
  className,
  children,
}: {
  title: ReactNode;
  body?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={cn("max-w-2xl", className)}>
      <h1 className="text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-5xl">{title}</h1>
      {body && <p className="mt-4 text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">{body}</p>}
      {children}
    </header>
  );
}

/** Kept for the pages that still call it: the rounded frames no longer carry corner marks. */
export function Crosses() {
  return null;
}

/** A thin title strip for panels: mono label on the left, anything on the right. */
export function PanelBar({ label, children, className }: { label: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-11 items-center justify-between gap-3 border-b border-neutral-950/[0.06] dark:border-neutral-50/[0.06] px-4", className)}>
      <span className="font-mono text-[11px] tracking-[0.14em] text-neutral-500 uppercase">{label}</span>
      {children}
    </div>
  );
}
