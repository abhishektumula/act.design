import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CopyButton } from "./kit/copy-button";
import { Eyebrow } from "./frame";

export function NewTag() {
  return (
    <span className="rounded-[3px] px-1.5 py-px font-mono text-[10px] tracking-[0.14em] text-signal uppercase ring-1 ring-signal/30">
      New
    </span>
  );
}

export function Breadcrumb({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-base-500 uppercase">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-base-700">/</span>}
          <Link href={item.href} className="transition-colors hover:text-base-200">
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
        <h1 className="text-5xl font-semibold tracking-[-0.045em] text-base-50">{title}</h1>
        {isNew && <NewTag />}
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-pretty text-base-400">{body}</p>
    </header>
  );
}

/** A terminal-style row with a copy button. */
export function CommandLine({ value }: { value: string }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-md bg-base-950 py-1 pr-1 pl-4 ring-1 ring-base-50/[0.08]">
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
      <Eyebrow>Installation</Eyebrow>
      <ol className="mt-6 divide-y divide-base-50/[0.06] border-y border-base-50/[0.06]">
        {steps.map((step, i) => (
          <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
            <span className="pt-0.5 font-mono text-[11px] text-signal tabular-nums">0{i + 1}</span>
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
    <nav className="mt-16 grid grid-cols-2 gap-px bg-base-50/[0.08] ring-1 ring-base-50/[0.08]">
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
