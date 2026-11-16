import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { BlockCard } from "@/components/site/block-card";
import { Crosses, Eyebrow } from "@/components/site/frame";
import { Features } from "@/components/site/features";
import { PreviewTile } from "@/components/site/preview-tile";
import { btnSecondary } from "@/components/site/styles";
import { blocks, getBlock, registry } from "@/registry/meta";

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body: string }) {
  return (
    <div className="max-w-2xl">
      <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
      <h2 className="text-4xl font-semibold tracking-[-0.04em] text-balance text-base-50 sm:text-6xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-pretty text-base-400">{body}</p>
    </div>
  );
}

/** Bento placement for the instrument index. */
const layout: [string, string][] = [
  ["dial", "lg:col-span-2 h-[460px]"],
  ["card-stack", "lg:row-span-2 h-[460px] lg:h-auto"],
  ["fader", "h-[460px]"],
  ["button", "h-[460px]"],
  ["switch", "h-[420px]"],
  ["segmented-control", "lg:col-span-2 h-[420px]"],
  ["stepper", "h-[420px]"],
  ["hold-to-confirm", "h-[420px]"],
  ["orb", "h-[420px]"],
  ["prompt-input", "lg:col-span-2 h-[420px]"],
  ["number-ticker", "h-[420px]"],
];

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        {/* Instruments */}
        <section className="border-t border-base-50/[0.06]">
          <div className="mx-auto max-w-[1400px] px-6 py-28 sm:py-36">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <SectionHeading
                eyebrow="Instruments"
                title={
                  <>
                    Fewer parts, <span className="font-serif font-normal tracking-[-0.02em] italic">each one finished.</span>
                  </>
                }
                body="No forty flavours of button. Each piece here was rebuilt until it felt right under a thumb, a trackpad and a keyboard. Every tile is live."
              />
              <Link href="/components" className={`${btnSecondary} h-10 rounded-md px-4 text-sm`}>
                All {registry.length} instruments <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {layout.map(([slug, className]) => (
                <PreviewTile key={slug} slug={slug} className={className} />
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="border-y border-base-50/[0.06] bg-base-950/40">
          <div className="mx-auto max-w-[1400px] px-6 py-28 sm:py-36">
            <SectionHeading
              eyebrow="Principles"
              title={
                <>
                  Built to feel <span className="font-serif font-normal tracking-[-0.02em] italic">like objects.</span>
                </>
              }
              body="Five rules every instrument follows. They are why a dial here turns like a dial, and why the rest of the page stays still while it does."
            />
            <Features />
          </div>
        </section>

        {/* Blocks */}
        <section className="mx-auto max-w-[1400px] px-6 py-28 sm:py-36">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading
              eyebrow="Blocks"
              title="Whole sections, assembled."
              body="Heroes, bento grids, pricing and more, built from the same parts. Responsive, themed and ready to paste as a complete section."
            />
            <Link href="/blocks" className={`${btnSecondary} h-10 rounded-md px-4 text-sm`}>
              All {blocks.length} blocks <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {["hero-monitor", "pricing-meter", "feature-rack", "gauges", "testimonials-deck", "cta-check"].map((slug) => (
              <BlockCard key={slug} block={getBlock(slug)!} />
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="mx-auto max-w-[1400px] px-6 pb-28">
          <div className="relative">
          <Crosses />
          <div className="relative overflow-hidden bg-base-50 px-8 py-24 text-center sm:py-32">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--base-900)_1px,transparent_1px),linear-gradient(to_bottom,var(--base-900)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            <div className="grain pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" />
            <div className="pointer-events-none absolute -bottom-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-signal/40 blur-[120px]" />
            <div className="relative">
              <h2 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-balance text-base-950 sm:text-7xl">
                Make something people{" "}
                <span className="font-serif font-normal tracking-[-0.02em] text-signal italic">want to touch.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-base-600">
                Copy a component, keep the feel, make it yours. No package to fight.
              </p>
              <div className="mt-10 flex justify-center">
                <Link
                  href="/components"
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-signal px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgb(0_0_0/0.14),inset_0_1px_0_rgb(255_255_255/0.16)] transition-colors hover:bg-[color-mix(in_oklab,var(--signal)_90%,white)]"
                >
                  Open the library <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
