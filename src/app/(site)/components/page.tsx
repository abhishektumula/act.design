import type { Metadata } from "next";
import { PreviewTile } from "@/components/site/preview-tile";
import { categories, registry } from "@/registry/meta";

export const metadata: Metadata = { title: "Components · Tasteful UI" };

export default function ComponentsIndex() {
  return (
    <div>
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-base-50">Components</h1>
        <p className="mt-4 text-lg leading-8 text-base-400">
          {registry.length} live components. Play with them here, open one to see its code, then copy it into your app.
        </p>
      </header>

      {categories.map((cat) => {
        const items = registry.filter((r) => r.category === cat);
        return (
          <section key={cat} id={cat.toLowerCase().replace(/\s/g, "-")} className="mt-20 scroll-mt-24">
            <div className="mb-6 flex items-baseline gap-3">
              <h2 className="text-xl font-medium tracking-tight text-base-100">{cat}</h2>
              <span className="text-sm text-base-600">{items.length}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <PreviewTile key={item.slug} slug={item.slug} className="h-[380px]" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
