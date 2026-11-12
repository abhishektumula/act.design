import type { Metadata } from "next";
import { PreviewTile } from "@/components/site/preview-tile";
import { categories, registry } from "@/registry/meta";

export const metadata: Metadata = { title: "Instruments · act.design" };

const blurbs: Record<(typeof categories)[number], string> = {
  Controls: "Things you turn, slide and flip.",
  Actions: "Buttons that ask for a real press.",
  Motion: "Movement that carries meaning.",
  AI: "Surfaces for talking to a model.",
  Navigation: "Getting around, fast.",
};

export default function ComponentsIndex() {
  return (
    <div>
      <header className="max-w-2xl">
        <h1 className="text-5xl font-semibold tracking-[-0.045em] text-base-50 sm:text-6xl">
          The <span className="font-serif font-normal tracking-[-0.02em] italic">instruments</span>
        </h1>
        <p className="mt-5 text-lg leading-8 text-base-400">
          {registry.length} live components. Play with them here, open one for its code and API, then copy it into your app.
        </p>
      </header>

      {categories.map((cat) => {
        const items = registry.filter((r) => r.category === cat);
        return (
          <section key={cat} id={cat.toLowerCase().replace(/\s/g, "-")} className="mt-20 scroll-mt-24">
            <div className="mb-6 flex items-baseline gap-4 border-b border-base-50/[0.07] pb-4">
              <h2 className="font-serif text-3xl tracking-[-0.01em] text-base-50 italic">{cat}</h2>
              <span className="text-sm text-base-500">{blurbs[cat]}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <PreviewTile key={item.slug} slug={item.slug} className="h-[420px]" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
