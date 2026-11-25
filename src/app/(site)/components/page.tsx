import type { Metadata } from "next";
import { Highlight } from "@/components/site/fx";
import { PageHeader } from "@/components/site/frame";
import { PreviewTile } from "@/components/site/preview-tile";
import { categories, registry } from "@/registry/meta";

export const metadata: Metadata = { title: "Components · act.design" };

const blurbs: Record<(typeof categories)[number], string> = {
  Controls: "Things you turn, slide and flip.",
  Actions: "Buttons that ask for a real press.",
  Text: "Type that gets made in front of you.",
  Motion: "Movement that carries meaning.",
  AI: "Surfaces for talking to a model.",
};

export default function ComponentsIndex() {
  return (
    <div>
      <PageHeader
        title={
          <>
            The <Highlight>components</Highlight>
          </>
        }
        body={`${registry.length} live components. Play with them here, open one for its code and API, then copy it into your app.`}
      />

      {categories.map((cat, i) => {
        const items = registry.filter((r) => r.category === cat);
        return (
          <section key={cat} id={cat.toLowerCase().replace(/\s/g, "-")} className="mt-20 scroll-mt-24">
            <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-neutral-950/[0.07] dark:border-neutral-50/[0.07] pb-4">
              <span className="grid size-6 place-items-center self-center rounded-md bg-neutral-100 dark:bg-neutral-900 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 tabular-nums ring-1 ring-neutral-950/10 dark:ring-neutral-50/10">{i + 1}</span>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50">{cat}</h2>
              <span className="text-sm text-neutral-500">{blurbs[cat]}</span>
              <span className="ml-auto font-mono text-[10px] tracking-[0.14em] text-neutral-500 uppercase">
                {items.length} {items.length === 1 ? "piece" : "pieces"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <PreviewTile key={item.slug} slug={item.slug} className="h-[500px]" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
