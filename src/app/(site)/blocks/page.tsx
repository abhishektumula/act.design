import type { Metadata } from "next";
import { BlockCard } from "@/components/site/block-card";
import { Footer } from "@/components/site/footer";
import { blockCategories, blocks } from "@/registry/meta";

export const metadata: Metadata = { title: "Blocks · Tasteful UI" };

const slugify = (s: string) => s.toLowerCase().replace(/\s/g, "-");

export default function BlocksIndex() {
  return (
    <>
      <main className="mx-auto w-full max-w-[1400px] px-6 pt-28 pb-24">
        <header className="max-w-2xl">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Blocks</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-5xl">
            Whole sections, ready to drop in.
          </h1>
          <p className="mt-5 text-lg leading-8 text-base-400">
            {blocks.length} responsive landing blocks built from the same components. Preview them at any width, then paste the
            whole section.
          </p>
        </header>

        <nav className="sticky top-16 z-10 -mx-6 mt-12 flex gap-2 overflow-x-auto bg-canvas/80 px-6 py-3 backdrop-blur-xl">
          {blockCategories.map((cat) => (
            <a
              key={cat}
              href={`#${slugify(cat)}`}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-sm text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-100"
            >
              {cat} <span className="text-base-600">{blocks.filter((b) => b.category === cat).length}</span>
            </a>
          ))}
        </nav>

        {blockCategories.map((cat) => (
          <section key={cat} id={slugify(cat)} className="mt-14 scroll-mt-32">
            <h2 className="mb-6 text-xl font-medium tracking-tight text-base-100">{cat}</h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {blocks
                .filter((b) => b.category === cat)
                .map((b) => (
                  <BlockCard key={b.slug} block={b} />
                ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
