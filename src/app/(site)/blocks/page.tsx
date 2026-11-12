import type { Metadata } from "next";
import { BlockCard } from "@/components/site/block-card";
import { Footer } from "@/components/site/footer";
import { blocks } from "@/registry/meta";

export const metadata: Metadata = { title: "Blocks · act.design" };

export default function BlocksIndex() {
  return (
    <>
      <main className="mx-auto w-full max-w-[1400px] px-6 pt-28 pb-24">
        <header className="max-w-2xl">
          <h1 className="text-5xl font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-6xl">
            Whole sections, <span className="font-serif font-normal tracking-[-0.02em] italic">assembled.</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-base-400">
            {blocks.length} landing sections built from the same instruments, so the controls in them actually work. Preview at any
            width, then paste the whole section.
          </p>
        </header>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {blocks.map((b) => (
            <BlockCard key={b.slug} block={b} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
