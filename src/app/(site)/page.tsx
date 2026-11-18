import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { BlockCard } from "@/components/site/block-card";
import { Crosses } from "@/components/site/frame";
import { Features } from "@/components/site/features";
import { PreviewTile } from "@/components/site/preview-tile";
import { CopyButton } from "@/components/site/kit/copy-button";
import { InstallTerminal, INSTALL } from "@/components/site/install-terminal";
import { btnPrimary, hairGrid } from "@/components/site/styles";
import { blocks, getBlock, registry } from "@/registry/meta";

/** Section header: the claim on the left, what it means and where to go on the right. */
function SectionHeading({ title, body, action }: { title: React.ReactNode; body: string; action?: React.ReactNode }) {
  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12 lg:items-end">
      <h2 className="text-[2.75rem] leading-[1] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-6xl lg:col-span-7">
        {title}
      </h2>
      <div className="lg:col-span-4 lg:col-start-9 lg:pb-1.5">
        <p className="max-w-md text-[17px] leading-7 text-pretty text-base-400">{body}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}

const linkArrow =
  "group inline-flex items-center gap-1.5 text-[15px] font-medium text-base-100 transition-colors hover:text-base-50";


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
            <SectionHeading
              title={
                <>
                  Fewer parts, <span className="font-serif font-normal tracking-[-0.02em] italic">each one finished.</span>
                </>
              }
              body="No forty flavours of button. Each piece was rebuilt until it felt right under a thumb, a trackpad and a keyboard. Every tile below is live."
              action={
                <Link href="/components" className={linkArrow}>
                  All {registry.length} instruments <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
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
          <SectionHeading
            title={
              <>
                Whole sections, <span className="font-serif font-normal tracking-[-0.02em] italic">assembled.</span>
              </>
            }
            body="Heroes, gauges, pricing and more for one made-up uptime product, built from the same parts. Responsive, themed and ready to paste."
            action={
              <Link href="/blocks" className={linkArrow}>
                All {blocks.length} blocks <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {["hero-monitor", "pricing-meter", "feature-rack", "gauges", "testimonials-deck", "cta-check"].map((slug) => (
              <BlockCard key={slug} block={getBlock(slug)!} />
            ))}
          </div>
        </section>

        {/* Closing: the same hairline frame as the rest of the page */}
        <section className="mx-auto max-w-[1400px] px-6 pb-28">
          <div className="relative">
            <Crosses />
            <div className={`${hairGrid} xl:grid-cols-[1.35fr_1fr]`}>
              {/* The ask */}
              <div className="flex min-w-0 flex-col bg-base-950 px-6 pt-12 pb-0 sm:px-12 sm:pt-20">
                <h2 className="max-w-2xl text-[2.75rem] leading-[1] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-6xl">
                  Make something people{" "}
                  <span className="font-serif font-normal tracking-[-0.02em] text-signal italic">want to touch.</span>
                </h2>
                <p className="mt-6 max-w-md text-[17px] leading-7 text-pretty text-base-400">
                  Copy a component, keep the feel, make it yours. No package to fight, no version to pin.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Link href="/components" className={`${btnPrimary} group h-11 rounded-md px-5 text-[15px]`}>
                    Open the library <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/setup"
                    className="text-[15px] font-medium text-base-200 underline decoration-base-700 underline-offset-[6px] transition-colors hover:text-base-50 hover:decoration-base-400"
                  >
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
              <div className="flex min-w-0 flex-col bg-base-950">
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
