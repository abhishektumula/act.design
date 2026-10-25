import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TextStagger } from "@/components/ui/text-stagger";
import { blocks, registry } from "@/registry/meta";
import { SearchKey } from "./search-key";
import { SpecimenBench } from "./specimen-bench";
import { btnPrimary } from "./styles";

export function Hero() {
  const facts = [
    { value: registry.length, label: "Components" },
    { value: blocks.length, label: "Landing blocks" },
    { value: "Light + dark", label: "Themes" },
    { value: "cn + cva", label: "Variants on every piece" },
  ];

  return (
    <section className="border-b border-base-50/5 pt-16">
      <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-24 sm:pt-28">
        {/* Masthead */}
        <div className="flex items-center gap-4 font-mono text-[11px] tracking-wider text-base-500 uppercase">
          <span className="text-base-300">Vol. 01</span>
          <span className="h-px flex-1 bg-base-50/10" />
          <Link href="/blocks" className="group inline-flex items-center gap-2 text-base-400 transition-colors hover:text-base-100">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            {blocks.length} blocks just landed
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-7xl lg:col-span-8 xl:text-[5.5rem]">
            <TextStagger text="Interfaces you can feel under the cursor." />
          </h1>
          <div className="lg:col-span-4 lg:pb-2">
            <p className="text-lg leading-8 text-pretty text-base-400">
              A small, opinionated collection of React components and full landing blocks. Each one is alive the moment it loads.
              Play with it below, then paste it into your app.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/components" className={`${btnPrimary} group h-12 rounded-xl pr-2 pl-5 text-[15px]`}>
                Open the library
                <span className="grid size-8 place-items-center rounded-lg bg-base-950/10 ring-1 ring-base-950/10">
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <SearchKey label="Find a piece" />
            </div>
          </div>
        </div>

        <div className="mt-16">
          <SpecimenBench />
        </div>

        <dl className="mt-6 grid grid-cols-2 divide-base-50/10 rounded-2xl ring-1 ring-base-50/10 sm:grid-cols-4 sm:divide-x">
          {facts.map((f) => (
            <div key={f.label} className="px-6 py-5">
              <dt className="font-mono text-[11px] tracking-wider text-base-500 uppercase">{f.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-base-50 tabular-nums">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
