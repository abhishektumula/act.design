import Link from "next/link";
import { ArrowRight, Layers, MousePointer2, Wind } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { BlockCard } from "@/components/site/block-card";
import { PreviewTile } from "@/components/site/preview-tile";
import { btnPrimary, btnSecondary } from "@/components/site/styles";
import { blocks, categories, getBlock, registry } from "@/registry/meta";

function SectionHeading({ index, eyebrow, title, body }: { index: string; eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <p className="flex items-center gap-3 font-mono text-[11px] tracking-wider text-base-500 uppercase">
        <span className="text-base-300">{index}</span>
        <span className="h-px w-8 bg-base-50/15" />
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-base-400">{body}</p>
    </div>
  );
}

const principles = [
  {
    icon: Wind,
    title: "Minimal by default",
    body: "Neutral surfaces, one accent, real whitespace. Nothing competes with your content.",
  },
  {
    icon: Layers,
    title: "Depth where it counts",
    body: "A 1px top highlight, a hairline ring and a soft shadow make the important things feel touchable.",
  },
  {
    icon: MousePointer2,
    title: "Motion with intent",
    body: "Springs, blur-in and shared layouts that explain what changed, then get out of the way.",
  },
];

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        {/* AI */}
        <section className="mx-auto max-w-[1400px] px-6 py-32">
          <SectionHeading
            index="01"
            eyebrow="AI components"
            title="Everything an agent interface needs."
            body="A voice orb that actually listens, a composer with model, effort and access controls, streaming text and plans that check themselves off."
          />
          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            <PreviewTile slug="ai-orb" className="h-[440px]" />
            <PreviewTile slug="prompt-input" className="h-[440px] lg:col-span-2" />
            <PreviewTile slug="reasoning" className="h-[400px]" />
            <PreviewTile slug="chat-thread" className="h-[400px]" />
            <PreviewTile slug="text-stagger" className="h-[400px]" />
          </div>
        </section>

        {/* Blocks */}
        <section className="border-y border-base-50/5 bg-base-950">
          <div className="mx-auto max-w-[1400px] px-6 py-32">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <SectionHeading
                index="02"
                eyebrow="Blocks"
                title="Whole sections, not just parts."
                body="Heroes, bento grids, pricing, testimonials and more. Each one responsive, themed and alive, ready to paste as a complete section."
              />
              <Link href="/blocks" className={`${btnSecondary} h-11 rounded-xl px-5 text-sm`}>
                All {blocks.length} blocks <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {["hero-ai", "bento-grid", "pricing", "hero-centered", "features-tabs", "testimonials"].map((slug) => (
                <BlockCard key={slug} block={getBlock(slug)!} />
              ))}
            </div>
          </div>
        </section>

        {/* Interactions */}
        <section className="mx-auto max-w-[1400px] px-6 py-32">
          <SectionHeading
            index="03"
            eyebrow="Interactions"
            title="The details people remember."
            body="Docks that magnify, toasts that fan out, cards that catch the light. Interactions that make a product feel expensive."
          />
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {["dock", "toast", "tooltip", "file-dropzone", "radio-cards", "data-table"].map((slug) => (
              <PreviewTile key={slug} slug={slug} className="h-[380px]" />
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/components#${cat.toLowerCase().replace(/\s/g, "-")}`}
                className="rounded-full px-3.5 py-1.5 text-sm text-base-400 ring-1 ring-base-50/10 transition-colors hover:bg-base-50/5 hover:text-base-100"
              >
                {cat} <span className="text-base-600">{registry.filter((r) => r.category === cat).length}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto max-w-[1400px] border-t border-base-50/5 px-6 py-32">
          <div className="grid gap-16 lg:grid-cols-3">
            {principles.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <span className="grid size-10 place-items-center rounded-xl bg-linear-to-b from-base-800 to-base-900 text-base-200 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/15 shadow-md shadow-shade/50">
                  <Icon className="size-4" />
                </span>
                <h3 className="mt-6 text-lg font-medium text-base-100">{title}</h3>
                <p className="mt-2 leading-7 text-base-500">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1400px] px-6 pb-32">
          <div className="relative overflow-hidden rounded-3xl bg-base-950 px-8 py-20 text-center ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10">
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-5xl">
                Stop rebuilding the same landing page.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-base-400">
                Sign in once and every component and block is a click away.
              </p>
              <div className="mt-10 flex justify-center gap-3">
                <Link href="/components" className={`${btnPrimary} group h-12 rounded-xl pr-2 pl-5 text-[15px]`}>
                  Open the library
                  <span className="grid size-8 place-items-center rounded-lg bg-base-950/10 ring-1 ring-base-950/10">
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <Link href="/login" className={`${btnSecondary} h-12 rounded-xl px-5 text-[15px]`}>
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
