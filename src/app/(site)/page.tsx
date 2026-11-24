import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { LayerText } from "@/components/ui/layer-text";
import { BlockThumb } from "@/components/site/block-frame";
import { HomeDrift } from "@/components/site/home-drift";
import { PruneShowcase } from "@/components/site/prune-showcase";
// Parked with the Principles section below:
// import { Features } from "@/components/site/features";
import { PreviewTile } from "@/components/site/preview-tile";
import { CopyButton } from "@/components/site/kit/copy-button";
import { InstallTerminal, INSTALL } from "@/components/site/install-terminal";
import { Chip, Highlight, SectionTitle } from "@/components/site/fx";
import { btnInk, btnPrimary, btnSecondary } from "@/components/site/styles";
import { blocks, getItem, registry } from "@/registry/meta";
import { ExternalLink } from "lucide-react";

const linkArrow = `${btnSecondary} group h-10 rounded-lg px-4 text-sm`;

/** Bento placement for the component index: the most hands-on pieces first. Three columns, no holes. */
const layout: [string, string][] = [
  ["layer-text", "lg:col-span-2 h-[460px]"],
  ["prune-reveal-animation", "lg:row-span-2 h-[660px] lg:h-auto"],
  ["compare-slider", "lg:col-span-2 h-[560px]"],
  ["dial", "lg:col-span-2 h-[540px]"],
  ["fader", "h-[540px]"],
  ["trash-bin", "lg:col-span-2 h-[500px]"],
  ["card-stack", "h-[500px]"],
  ["segmented-control", "h-[460px]"],
  ["hold-to-confirm", "h-[460px]"],
  ["orb", "h-[460px]"],
];

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        {/* The name, set in Layer Text: every letter is a layer you can select */}
        <section aria-label="act.design" className="relative overflow-hidden border-y border-neutral-950/[0.06] dark:border-neutral-50/[0.06] py-16 sm:py-24">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center px-6">
            <LayerText text="act.design" size="clamp(4rem, 16vw, 15rem)" weight={800} tracking={-0.05} handle={10} className="text-neutral-950 dark:text-neutral-50" />
            <p className="mt-12 text-sm text-neutral-500">
              Point at a letter. This is <Link href="/components/layer-text" className="text-neutral-800 dark:text-neutral-200 underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4 hover:text-neutral-950 dark:hover:text-neutral-50">Layer Text</Link>, one of the components.
            </p>
          </div>
        </section>

        {/* Components */}
        <section className="relative">
          <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
            <SectionTitle
              chip={
                <Chip label="Components" count={`${registry.length} live`} />
              }
              title={
                <>
                  Fewer parts, <Highlight>each one finished</Highlight>
                </>
              }
              body="No forty flavours of button. Each piece was rebuilt until it felt right under a thumb, a trackpad and a keyboard. Every tile below is live."
              action={
                <Link href="/components" className={linkArrow}>
                  All {registry.length} components{" "}
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

        {/* AI: an image that arrives by being pruned into view */}
        <section className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
            <div>
              <Chip label="AI" count="Prune Reveal Animation" />
              <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.025em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-4xl">
                Images that arrive <Highlight>by fire</Highlight>
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
                While the model works, the frame pulses with your prompt. When the image is ready the surface is touched at one spot and burns away from
                there, along a path that is never the same twice, embers and ash rising off its glowing edge.
              </p>
              <ul className="mt-8 grid max-w-lg gap-3 text-[15px] text-neutral-700 dark:text-neutral-300 sm:grid-cols-2">
                {["A pulse while it generates", "A burn that finds its own path", "Embers, ash and heat at the edge", "Regenerate over the old image"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/components/prune-reveal-animation" className={`${btnPrimary} group h-11 rounded-lg px-5 text-[15px]`}>
                  Open Prune Reveal <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/components#ai" className={`${btnSecondary} h-11 rounded-lg px-5 text-[15px]`}>
                  More AI components
                </Link>
              </div>
            </div>
            <PruneShowcase />
          </div>
        </section>

        {/* An endless canvas of images drifting one way: Drift Canvas */}
        <section aria-labelledby="drift-title" className="py-20 sm:py-28">
          <div className="mx-auto max-w-[1400px] px-6">
            <h2 id="drift-title" className="text-3xl leading-tight font-semibold tracking-[-0.025em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-4xl">
              A canvas that <Highlight>never ends</Highlight>
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
              Every component on one canvas, drifting one way forever like a marquee in two directions. Grab it and move it anywhere, or open any card. It is{" "}
              <Link href="/components/drift-canvas" className="text-neutral-800 dark:text-neutral-200 underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4 hover:text-neutral-950 dark:hover:text-neutral-50">
                Drift Canvas
              </Link>
              .
            </p>
          </div>
          <HomeDrift />
        </section>

        {/*
          Principles ("Five rules"): parked for now. The component (features.tsx, principles.css)
          stays in the project; uncomment this section and the Features import to bring it back.

        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
            <SectionTitle
              chip={<Chip label="Principles" count="5 rules" />}
              title={
                <>
                  Built to feel <Highlight>like objects</Highlight>
                </>
              }
              body="Five rules every component follows. They are why a dial here turns like a dial, and why the rest of the page stays still while it does."
            />
            <Features />
          </div>
        </section>

        */}

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
          {/* Two of them, image always on the right; the list fades out under a way to the rest */}
          <div className="relative mt-16">
            <div className="space-y-20 [mask-image:linear-gradient(to_bottom,#000_calc(100%-26rem),transparent_calc(100%-4rem))] sm:space-y-24">
              {blocks.slice(0, 2).map((b) => (
                <article
                  key={b.slug}
                  className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-16"
                >
                  <div>
                    <p className="text-sm text-neutral-500">{b.category}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-50 sm:text-3xl">
                      {b.name}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-pretty text-neutral-600 dark:text-neutral-400">
                      {b.description}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {b.uses.map((slug) => (
                        <li key={slug}>
                          <Link
                            href={`/components/${slug}`}
                            className="inline-flex rounded-md bg-neutral-100 dark:bg-neutral-900 px-2 py-1 text-[13px] text-neutral-700 dark:text-neutral-300 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06] transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
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
                    data-glow
                    className="group block rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 p-2 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06] transition-colors hover:ring-neutral-950/15 dark:hover:ring-neutral-50/15"
                  >
                    <BlockThumb
                      slug={b.slug}
                      className="aspect-[16/10] rounded-xl ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]"
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
          <div data-glow className="relative overflow-hidden rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 ring-1 ring-neutral-950/[0.06] dark:ring-neutral-50/[0.06]">
            <div className="relative grid xl:grid-cols-[1.35fr_1fr]">
              {/* The ask */}
              <div className="flex min-w-0 flex-col px-6 pt-12 pb-0 sm:px-12 sm:pt-20">
                <h2 className="max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance text-neutral-950 dark:text-neutral-50 sm:text-5xl">
                  Make something people <Highlight>want to touch</Highlight>
                </h2>
                <p className="mt-5 max-w-md text-lg leading-8 text-pretty text-neutral-600 dark:text-neutral-400">
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
                      className={`w-px ${i % 8 === 0 ? "h-full" : i % 4 === 0 ? "h-5" : "h-3"} ${i <= 30 ? "bg-blue-600 dark:bg-blue-500" : "bg-neutral-950/15 dark:bg-neutral-50/15"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Getting started, for real: the command to copy, and a terminal running it */}
              <div className="flex min-w-0 flex-col border-t border-neutral-950/[0.06] dark:border-neutral-50/[0.06] xl:border-t-0 xl:border-l">
                <div className="flex h-11 items-center justify-between gap-3 border-b border-neutral-950/[0.06] dark:border-neutral-50/[0.06] px-6">
                  <span className="text-[13px] text-neutral-500">
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
