import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CopyButton } from "./kit/copy-button";

export function NewTag() {
  return (
    <span className="rounded-md bg-signal/10 px-2 py-0.5 text-xs font-medium text-signal ring-1 ring-signal/25">New</span>
  );
}

export function Breadcrumb({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-base-500">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-base-700">/</span>}
          <Link href={item.href} aria-current={i === items.length - 1 ? "page" : undefined} className={`transition-colors hover:text-base-200 ${i === items.length - 1 ? "text-base-100" : ""}`}>
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

/** Title block for a component or block page. */
export function DocHeader({ crumbs, title, isNew, body }: { crumbs: { href: string; label: string }[]; title: string; isNew?: boolean; body: string }) {
  return (
    <header>
      <Breadcrumb items={crumbs} />
      <div className="mt-6 flex items-center gap-3">
        <h1 className="text-4xl font-semibold tracking-[-0.025em] text-base-50 sm:text-5xl">{title}</h1>
        {isNew && <NewTag />}
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-pretty text-base-400">{body}</p>
    </header>
  );
}

/** A terminal-style row with a copy button. */
export function CommandLine({ value }: { value: string }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-base-950 py-1 pr-1 pl-4 ring-1 ring-base-50/[0.08]">
      <span className="font-mono text-sm text-base-600 select-none">$</span>
      <code className="scrollbar-thin flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap text-base-200">{value}</code>
      <CopyButton value={value} />
    </div>
  );
}

/** Numbered install steps in a hairline list. */
export function Steps({ steps }: { steps: ReactNode[] }) {
  return (
    <section className="mt-20">
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-base-50">Installation</h2>
      <ol className="mt-5 divide-y divide-base-50/[0.06] border-y border-base-50/[0.06]">
        {steps.map((step, i) => (
          <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
            <span className="grid size-6 place-items-center rounded-md bg-base-900 font-mono text-[11px] text-base-200 tabular-nums ring-1 ring-base-50/10">{i + 1}</span>
            <div className="min-w-0 text-sm leading-6 text-base-400">{step}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

type Neighbour = { href: string; name: string } | undefined;

export function PrevNext({ prev, next }: { prev: Neighbour; next: Neighbour }) {
  const cell = "group bg-base-950 p-5 transition-colors hover:bg-base-900";
  const label = "flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-base-500 uppercase";
  return (
    <nav className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-base-50/[0.08] ring-1 ring-base-50/[0.08]">
      {prev ? (
        <Link href={prev.href} className={cell}>
          <span className={label}>
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" /> Previous
          </span>
          <span className="mt-2 block text-[15px] text-base-100">{prev.name}</span>
        </Link>
      ) : (
        <span className="bg-base-950" />
      )}
      {next ? (
        <Link href={next.href} className={`${cell} text-right`}>
          <span className={`${label} justify-end`}>
            Next <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-2 block text-[15px] text-base-100">{next.name}</span>
        </Link>
      ) : (
        <span className="bg-base-950" />
      )}
    </nav>
  );
}
