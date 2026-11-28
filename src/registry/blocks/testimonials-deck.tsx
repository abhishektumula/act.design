"use client";

import { Star } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { CardStack } from "@/components/ui/card-stack";
import { cn } from "@/lib/utils";

const quotes = [
  {
    id: "1",
    quote: "We used to take seven weeks to fill an engineering role. Our last three hires signed in under nine days.",
    name: "Priya Raman",
    outcome: "9 days",
    outcomeNote: "from first application to signed offer",
    role: "Head of Talent, Ledgerly",
    tone: "paper",
  },
  {
    id: "2",
    quote: "We moved 140 open roles over in an afternoon. The shortlists found people our old keyword filters had been throwing away.",
    name: "Tom Becker",
    outcome: "140",
    outcomeNote: "open roles moved over in one afternoon",
    role: "Recruiting Ops, Parcelbay",
    tone: "signal",
  },
  {
    id: "3",
    quote: "Hiring used to mean five engineers giving up an afternoon each. Now one interviewer meets a shortlist that's already a fit.",
    name: "Ana Ruiz",
    outcome: "1 panel",
    outcomeNote: "per hire, instead of five rounds",
    role: "CTO, Fieldkit",
    tone: "ink",
  },
  {
    id: "4",
    quote: "Every candidate hears back within a day now, even the ones we turn down. Our offer acceptance rate went up by half.",
    name: "Daniel Okafor",
    outcome: "50%",
    outcomeNote: "more offers accepted",
    role: "People Lead, Tandem",
    tone: "paper",
  },
];

const tones = {
  paper: "bg-linear-to-b from-orange-50 to-neutral-200 text-neutral-800",
  signal: "bg-linear-to-b from-[color-mix(in_oklab,var(--color-blue-600)_78%,white)] dark:from-[color-mix(in_oklab,var(--color-blue-500)_78%,white)] to-[color-mix(in_oklab,var(--color-blue-600)_88%,black)] dark:to-[color-mix(in_oklab,var(--color-blue-500)_88%,black)] text-white",
  ink: "bg-linear-to-b from-neutral-800 to-neutral-900 text-neutral-100",
} as const;

/*
 * Behind the deck, a frame of hairlines that run the full height and width of
 * the section, each with a short beam of light travelling along it. The
 * beams start at different moments and speeds, so they never line up.
 */
const V_LINES = [
  { at: "8%", delay: 0, seconds: 7 },
  { at: "52%", delay: 2.4, seconds: 9 },
  { at: "92%", delay: 4.1, seconds: 8 },
];
const H_LINES = [
  { at: "18%", delay: 1.2, seconds: 10 },
  { at: "84%", delay: 5.3, seconds: 11 },
];

function Lines() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]">
      <style>{`
        @keyframes crew-beam-y { from { top: -20%; } to { top: 110%; } }
        @keyframes crew-beam-x { from { left: -20%; } to { left: 110%; } }
      `}</style>
      {V_LINES.map((l) => (
        <div key={l.at} style={{ left: l.at }} className="absolute inset-y-0 w-px overflow-hidden bg-neutral-950/[0.07] dark:bg-neutral-50/[0.08]">
          {!reduce && (
            <span
              style={{ animation: `crew-beam-y ${l.seconds}s linear ${l.delay}s infinite` }}
              className="absolute -top-[20%] left-0 h-[18%] w-px bg-linear-to-b from-transparent via-blue-500 to-transparent dark:via-blue-400"
            />
          )}
        </div>
      ))}
      {H_LINES.map((l) => (
        <div key={l.at} style={{ top: l.at }} className="absolute inset-x-0 h-px overflow-hidden bg-neutral-950/[0.07] dark:bg-neutral-50/[0.08]">
          {!reduce && (
            <span
              style={{ animation: `crew-beam-x ${l.seconds}s linear ${l.delay}s infinite` }}
              className="absolute top-0 -left-[20%] h-px w-[14%] bg-linear-to-r from-transparent via-blue-500 to-transparent dark:via-blue-400"
            />
          )}
        </div>
      ))}
      {/* A plus where lines cross, like registration marks */}
      {[
        ["8%", "18%"],
        ["92%", "18%"],
        ["8%", "84%"],
        ["92%", "84%"],
      ].map(([x, y]) => (
        <span key={`${x}${y}`} style={{ left: x, top: y }} className="absolute size-3 -translate-x-1/2 -translate-y-1/2 text-neutral-950/25 dark:text-neutral-50/25">
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
        </span>
      ))}
    </div>
  );
}

/**
 * Testimonials dealt as a deck. Visitors fling through the quotes; the score
 * and logos stay put beside them. Behind it all, hairlines frame the section
 * and beams of light travel along them.
 */
export function TestimonialsDeck({ className }: { className?: string }) {
  return (
    <section data-slot="testimonials-deck" className={cn("relative overflow-hidden bg-white px-6 py-24 sm:py-32 dark:bg-black", className)}>
      <Lines />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_24rem]">
        <div>
          <h2 className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-neutral-950 sm:text-6xl dark:text-neutral-50">
            Fewer interviews. <span className="text-neutral-400 dark:text-neutral-500">Better hires.</span>
          </h2>
          <div className="mt-10 flex items-center gap-5">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-5 fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500" />
              ))}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-950 dark:text-neutral-50">4.8</span> on G2 from 640 reviews
            </p>
          </div>
          <p className="mt-12 text-sm text-neutral-500">Hiring for</p>
          <ul className="mt-3 flex max-w-md flex-wrap gap-x-7 gap-y-2">
            {["Ledgerly", "Parcelbay", "Fieldkit", "Tandem", "Northwind", "Kiln"].map((l) => (
              <li key={l} className="text-lg font-semibold tracking-[-0.02em] text-neutral-600 dark:text-neutral-400">
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[23rem]">
          <CardStack
            items={quotes}
            aspectRatio="6 / 7"
            className="max-w-none"
            renderItem={(q) => (
              <figure
                className={cn(
                  "flex size-full flex-col overflow-hidden rounded-[24px] p-7 shadow-[0_1px_0_rgb(255_255_255/0.4)_inset,0_30px_50px_-24px_rgb(0_0_0/0.45)] ring-1 ring-black/10 select-none",
                  tones[q.tone as keyof typeof tones],
                )}
              >
                {/* The outcome leads; the quote explains it */}
                <p className="text-6xl leading-none font-semibold tracking-[-0.05em] whitespace-nowrap">{q.outcome}</p>
                <p className="mt-2 text-sm leading-5 opacity-70">{q.outcomeNote}</p>
                <blockquote className="mt-auto text-xl leading-snug font-medium tracking-[-0.01em] text-pretty">&ldquo;{q.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-current/15 pt-5">
                  <span className="grid size-9 place-items-center rounded-full bg-current/10 text-[11px] font-semibold ring-1 ring-current/15">
                    {q.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{q.name}</span>
                    <span className="block text-xs opacity-70">{q.role}</span>
                  </span>
                </figcaption>
              </figure>
            )}
          />
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <TestimonialsDeck />;
}
