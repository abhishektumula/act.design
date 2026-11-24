import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { BlockThumb } from "@/components/site/block-frame";
import { Playground } from "@/components/site/playground";
import { Features } from "@/components/site/features";
import { PreviewTile } from "@/components/site/preview-tile";
import { CopyButton } from "@/components/site/kit/copy-button";
import { InstallTerminal, INSTALL } from "@/components/site/install-terminal";
import { Chip, Highlight, SectionTitle } from "@/components/site/fx";
import { btnInk, btnPrimary, btnSecondary } from "@/components/site/styles";
import { blocks, getItem, registry } from "@/registry/meta";
import { ExternalLink } from "lucide-react";

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
  ["compare-slider", "lg:col-span-2 h-[560px]"],
  ["trash-bin", "h-[560px]"],
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
              chip={
                <Chip label="Instruments" count={`${registry.length} live`} />
              }
              title={
                <>
                  Fewer parts, <Highlight>each one finished</Highlight>
                </>
              }
              body="No forty flavours of button. Each piece was rebuilt until it felt right under a thumb, a trackpad and a keyboard. Every tile below is live."
              action={
                <Link href="/components" className={linkArrow}>
                  All {registry.length} instruments{" "}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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

        {/* The library on one endless canvas: a band across the page, not a tile */}
        <section
          aria-labelledby="canvas-title"
          className="relative h-[42rem] overflow-hidden border-y border-base-50/[0.06] bg-base-950/40"
        >
          <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent),linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] [mask-composite:intersect]">
            <Playground />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-[1400px] px-6 pt-14">
            <div className="pointer-events-auto w-fit max-w-md rounded-2xl bg-canvas/85 p-6 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)] ring-1 ring-base-50/[0.08] backdrop-blur-xl">
              <Chip label="Canvas" count="drag anywhere" />
              <h2
                id="canvas-title"
                className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.025em] text-base-50"
              >
                Every instrument, <Highlight>at once</Highlight>
              </h2>
              <p className="mt-3 text-base leading-7 text-base-400">
                The whole library on one canvas that never ends. Drag in any
                direction, throw it, or step with the arrow keys. It is the
                Infinite Grid, and it is yours to copy too.
              </p>
              <Link
                href="/components/infinite-grid"
                className={`${btnSecondary} group mt-5 h-10 rounded-lg px-4 text-sm`}
              >
                Infinite Grid{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
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

        {/* Blocks, each shown whole: what it is, what it is made of, and the way in */}
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
                All {blocks.length} blocks{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          {/* Four of them, image always on the right; the list fades out under a way to the rest */}
          <div className="relative mt-16">
            <div className="space-y-20 [mask-image:linear-gradient(to_bottom,#000_calc(100%-26rem),transparent_calc(100%-4rem))] sm:space-y-24">
              {blocks.slice(0, 4).map((b) => (
                <article
                  key={b.slug}
                  className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-16"
                >
                  <div>
                    <p className="text-sm text-base-500">{b.category}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-base-50 sm:text-3xl">
                      {b.name}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-pretty text-base-400">
                      {b.description}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {b.uses.map((slug) => (
                        <li key={slug}>
                          <Link
                            href={`/components/${slug}`}
                            className="inline-flex rounded-md bg-base-900 px-2 py-1 text-[13px] text-base-300 ring-1 ring-base-50/[0.06] transition-colors hover:text-base-50"
                          >
                            {getItem(slug)?.name ?? slug}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap gap-2">
                      <a
                        href={`/view/blocks/${b.slug}`}
                        target="_blank"
                        className={`${btnSecondary} h-10 rounded-lg px-4 text-sm`}
                      >
                        <ExternalLink className="size-4" /> Live preview
                      </a>
                      <Link
                        href={`/blocks/${b.slug}`}
                        className={`${btnInk} h-10 rounded-lg px-4 text-sm`}
                      >
                        Get the code
                      </Link>
                    </div>
                  </div>
                  <Link
                    href={`/blocks/${b.slug}`}
                    aria-label={`Open ${b.name}`}
                    className="group block rounded-2xl bg-base-900/60 p-2 ring-1 ring-base-50/[0.06] transition-colors hover:ring-base-50/15"
                  >
                    <BlockThumb
                      slug={b.slug}
                      className="aspect-[16/10] rounded-xl ring-1 ring-base-50/[0.06]"
                    />
                  </Link>
                </article>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-16 flex justify-center">
              <Link
                href="/blocks"
                className={`${btnSecondary} group h-11 rounded-full px-5 text-[15px] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)]`}
              >
                Show all {blocks.length} blocks{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
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
                  Copy a component, keep the feel, make it yours. No package to
                  fight, no version to pin.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    href="/components"
                    className={`${btnPrimary} group h-11 rounded-lg px-5 text-[15px]`}
                  >
                    Open the library{" "}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/setup"
                    className={`${btnSecondary} h-11 rounded-lg px-5 text-[15px]`}
                  >
                    Read the setup guide
                  </Link>
                </div>
                {/* A fader scale running along the foot */}
                <div
                  aria-hidden
                  className="mt-16 flex h-10 items-end justify-between sm:mt-20"
                >
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
                  <span className="text-[13px] text-base-500">
                    Install the shared packages
                  </span>
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
