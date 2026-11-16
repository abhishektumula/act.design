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
      <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-6xl">{title}</h1>
      {body && <p className="mt-5 text-lg leading-8 text-pretty text-base-400">{body}</p>}
      {children}
    </header>
  );
}

/** A small "+" sitting on a grid intersection. */
function Cross({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute z-10 size-3 ${className}`}>
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-base-400" />
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-base-400" />
    </span>
  );
}

/** "+" marks on all four corners of the nearest positioned parent. */
export function Crosses() {
  return (
    <>
      <Cross className="-top-1.5 -left-1.5" />
      <Cross className="-top-1.5 -right-1.5" />
      <Cross className="-bottom-1.5 -left-1.5" />
      <Cross className="-right-1.5 -bottom-1.5" />
    </>
  );
}

/** A thin title strip for panels: mono label on the left, anything on the right. */
export function PanelBar({ label, children, className }: { label: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-11 items-center justify-between gap-3 border-b border-base-50/[0.06] px-4", className)}>
      <span className="font-mono text-[11px] tracking-[0.14em] text-base-500 uppercase">{label}</span>
      {children}
    </div>
  );
}
