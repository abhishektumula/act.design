"use client";

import { Star } from "lucide-react";
import { CardStack } from "@/components/ui/card-stack";
import { cn } from "@/lib/utils";

const quotes = [
  {
    id: "1",
    quote: "It’s the first tool our designers and engineers argue about less, because they can both see the dials.",
    name: "Ines Moreau",
    role: "Head of Product, Fieldnote",
    tone: "paper",
  },
  {
    id: "2",
    quote: "We replaced three dashboards and a Notion page with one panel. Onboarding went from a week to an afternoon.",
    name: "Kwame Asante",
    role: "CTO, Lumen Freight",
    tone: "signal",
  },
  {
    id: "3",
    quote: "The little things, like limits pushing back instead of silently failing, saved us from at least two incidents.",
    name: "Hana Sato",
    role: "Staff Engineer, Pollen",
    tone: "ink",
  },
  {
    id: "4",
    quote: "Nobody asked for an interface that feels expensive. Everybody noticed when we had one.",
    name: "Diego Alves",
    role: "Founder, Quietly",
    tone: "paper",
  },
];

const tones = {
  paper: "bg-linear-to-b from-[#fbf8f1] to-[#ece5d6] text-[#2a2620]",
  signal: "bg-linear-to-b from-[color-mix(in_oklab,var(--signal)_78%,white)] to-[color-mix(in_oklab,var(--signal)_88%,black)] text-white",
  ink: "bg-linear-to-b from-[#34312c] to-[#1b1a17] text-[#f3efe6]",
} as const;

/**
 * Testimonials dealt as a deck. Visitors fling through the quotes; the score
 * and logos stay put beside them.
 */
export function TestimonialsDeck({ className }: { className?: string }) {
  return (
    <section data-slot="testimonials-deck" className={cn("overflow-hidden bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-6xl">
            Once they&apos;ve <span className="font-serif font-normal tracking-[-0.02em] italic">touched it,</span> they stay.
          </h2>
          <div className="mt-10 flex items-center gap-5">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-5 fill-signal text-signal" />
              ))}
            </div>
            <p className="text-sm text-base-400">
              <span className="font-semibold text-base-50">4.9</span> from 2,100 reviews
            </p>
          </div>
          <div className="mt-12 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl bg-base-50/[0.07] ring-1 ring-base-50/[0.07]">
            {["Fieldnote", "Lumen", "Pollen", "Quietly", "Northway", "Arcade"].map((l) => (
              <span key={l} className="bg-canvas py-4 text-center font-serif text-lg text-base-400 italic transition-colors hover:text-base-50">
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[21rem]">
          <CardStack
            items={quotes}
            className="max-w-none"
            renderItem={(q) => (
              <figure
                className={cn(
                  "flex size-full flex-col justify-between overflow-hidden rounded-[24px] p-7 shadow-[0_1px_0_rgb(255_255_255/0.4)_inset,0_30px_50px_-24px_rgb(0_0_0/0.45)] ring-1 ring-black/10 select-none",
                  tones[q.tone as keyof typeof tones],
                )}
              >
                <span className="font-serif text-7xl leading-[0.6] opacity-60">“</span>
                <blockquote className="text-xl leading-snug font-medium tracking-[-0.01em] text-balance">{q.quote}</blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-current/10 font-mono text-[11px] font-medium ring-1 ring-current/15">
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
