import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { BlockCard } from "@/components/site/block-card";
import { Features } from "@/components/site/features";
import { PreviewTile } from "@/components/site/preview-tile";
import { CopyButton } from "@/components/site/kit/copy-button";
import { InstallTerminal, INSTALL } from "@/components/site/install-terminal";
import { Chip, Highlight, SectionTitle } from "@/components/site/fx";
import { btnPrimary, btnSecondary } from "@/components/site/styles";
import { blocks, getBlock, registry } from "@/registry/meta";

const linkArrow = `${btnSecondary} group h-10 rounded-lg px-4 text-sm`;


/** Bento placement for the instrument index. */
const layout: [string, string][] = [
  ["dial", "lg:col-span-2 h-[540px]"],
  ["card-stack", "lg:row-span-2 h-[540px] lg:h-auto"],
  ["fader", "h-[540px]"],
  ["button", "h-[540px]"],
  ["switch", "h-[500px]"],
  ["segmented-control", "lg:col-span-2 h-[500px]"],
  ["stepper", "h-[500px]"],
  ["hold-to-confirm", "h-[500px]"],
  ["orb", "h-[500px]"],
  ["prompt-input", "lg:col-span-2 h-[500px]"],
  ["number-ticker", "h-[500px]"],
];

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        {/* Instruments */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
            <SectionTitle
              chip={<Chip label="Instruments" count={`${registry.length} live`} />}
              title={
                <>
                  Fewer parts, <Highlight>each one finished</Highlight>
                </>
              }
              body="No forty flavours of button. Each piece was rebuilt until it felt right under a thumb, a trackpad and a keyboard. Every tile below is live."
              action={
                <Link href="/components" className={linkArrow}>
                  All {registry.length} instruments <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {layout.map(([slug, className]) => (
                <PreviewTile key={slug} slug={slug} className={className} />
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
            <SectionTitle
              chip={<Chip label="Principles" count="5 rules" />}
              title={
                <>
                  Built to feel <Highlight>like objects</Highlight>
                </>
              }
              body="Five rules every instrument follows. They are why a dial here turns like a dial, and why the rest of the page stays still while it does."
            />
            <Features />
          </div>
        </section>

        {/* Blocks */}
        <section className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
          <SectionTitle
            chip={<Chip label="Blocks" count={`${blocks.length} sections`} />}
            title={
              <>
                Whole sections, <Highlight>assembled</Highlight>
              </>
            }
            body="Heroes, gauges, pricing and more for one made-up uptime product, built from the same parts. Responsive, themed and ready to paste."
            action={
              <Link href="/blocks" className={linkArrow}>
                All {blocks.length} blocks <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {["hero-monitor", "pricing-meter", "feature-rack", "gauges", "testimonials-deck", "cta-check"].map((slug) => (
              <BlockCard key={slug} block={getBlock(slug)!} />
            ))}
          </div>
        </section>

        {/* Closing: one lit card, the ask on the left and the install running on the right */}
        <section className="mx-auto max-w-[1400px] px-6 pb-28">
          <div className="relative overflow-hidden rounded-2xl bg-base-900/60 ring-1 ring-base-50/[0.06]">
            <div className="relative grid xl:grid-cols-[1.35fr_1fr]">
              {/* The ask */}
              <div className="flex min-w-0 flex-col px-6 pt-12 pb-0 sm:px-12 sm:pt-20">
                <h2 className="max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance text-base-50 sm:text-5xl">
                  Make something people <Highlight>want to touch</Highlight>
                </h2>
                <p className="mt-5 max-w-md text-lg leading-8 text-pretty text-base-400">
                  Copy a component, keep the feel, make it yours. No package to fight, no version to pin.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="/components" className={`${btnPrimary} group h-11 rounded-lg px-5 text-[15px]`}>
                    Open the library <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/setup" className={`${btnSecondary} h-11 rounded-lg px-5 text-[15px]`}>
                    Read the setup guide
                  </Link>
                </div>
                {/* A fader scale running along the foot */}
                <div aria-hidden className="mt-16 flex h-10 items-end justify-between sm:mt-20">
                  {Array.from({ length: 49 }, (_, i) => (
                    <span
                      key={i}
                      className={`w-px ${i % 8 === 0 ? "h-full" : i % 4 === 0 ? "h-5" : "h-3"} ${i <= 30 ? "bg-signal" : "bg-base-50/15"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Getting started, for real: the command to copy, and a terminal running it */}
              <div className="flex min-w-0 flex-col border-t border-base-50/[0.06] xl:border-t-0 xl:border-l">
                <div className="flex h-11 items-center justify-between gap-3 border-b border-base-50/[0.06] px-6">
                  <span className="text-[13px] text-base-500">Install the shared packages</span>
                  <CopyButton value={INSTALL} size="sm" />
                </div>
                <InstallTerminal />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
