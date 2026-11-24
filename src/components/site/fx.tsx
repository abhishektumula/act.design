import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * A phrase drawn as a selected layer in a design tool: a hairline box, a hatched fill
 * and a handle on every corner. Used once per heading, on the words that matter.
 */
export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("relative mx-[0.08em] inline-block px-[0.12em] whitespace-nowrap", className)}>
      <span aria-hidden className="hatch absolute inset-0 border border-signal/70" />
      {["-top-[3px] -left-[3px]", "-top-[3px] -right-[3px]", "-bottom-[3px] -left-[3px]", "-right-[3px] -bottom-[3px]"].map((at) => (
        <span key={at} aria-hidden className={`absolute size-[6px] border border-signal bg-canvas ${at}`} />
      ))}
      <span className="relative">{children}</span>
    </span>
  );
}

/** A two-part label: what it is, then how many. */
export function Chip({ label, count, href, className }: { label: ReactNode; count?: ReactNode; href?: string; className?: string }) {
  const body = (
    <>
      <span className="rounded-[5px] bg-base-800 px-2 py-0.5 text-base-50">{label}</span>
      {count && <span className="pr-2 pl-1.5 text-base-400">{count}</span>}
    </>
  );
  const cls = cn(
    "inline-flex items-center rounded-md bg-base-900 p-0.5 text-xs font-medium ring-1 ring-base-50/[0.06]",
    href && "group transition-colors hover:ring-base-50/15",
    className,
  );
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <span className={cls}>{body}</span>
  );
}

/** A left-aligned section header: a chip, a heading and a short lede. */
export function SectionTitle({ chip, title, body, action }: { chip: ReactNode; title: ReactNode; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
      <div className="max-w-3xl">
        {chip}
        <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.025em] text-balance text-base-50 sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-pretty text-base-400">{body}</p>
      </div>
      {action}
    </div>
  );
}

/** "new", drawn as a selected layer: a hairline box with a handle on each corner. */
export function NewMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-[18px] items-center border border-signal/70 px-1 text-[11px] leading-none font-medium text-signal", className)}>
      {["-top-[2.5px] -left-[2.5px]", "-top-[2.5px] -right-[2.5px]", "-bottom-[2.5px] -left-[2.5px]", "-right-[2.5px] -bottom-[2.5px]"].map((at) => (
        <span key={at} aria-hidden className={`absolute size-[4px] border border-signal bg-canvas ${at}`} />
      ))}
      new
    </span>
  );
}
