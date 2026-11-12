"use client";

import { useState } from "react";
import { Check, CornerDownLeft } from "lucide-react";
import { Fader } from "@/components/ui/fader";
import { Keycap } from "@/components/ui/keycap";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { RollingNumber, Stepper } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

const tiers = [
  { id: "hobby", name: "Hobby", base: 0, note: "Up to 50k requests, one seat" },
  { id: "pro", name: "Pro", base: 19, note: "Up to 2M requests" },
  { id: "scale", name: "Scale", base: 249, note: "Everything above 2M" },
] as const;

/** 0–100 on the fader maps to 10k–10M requests on a log scale. */
const toRequests = (p: number) => Math.round(10_000 * Math.pow(1000, p / 100) / 1000) * 1000;
const compact = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function quote(requests: number, seats: number, yearly: boolean) {
  const tier = requests <= 50_000 && seats === 1 ? tiers[0] : requests <= 2_000_000 ? tiers[1] : tiers[2];
  const usage = tier.id === "hobby" ? 0 : (Math.max(0, requests - 50_000) / 1000) * 0.05;
  const monthly = tier.base + usage + (seats - 1) * 9;
  return { tier, price: Math.round(monthly * (yearly ? 0.8 : 1)) };
}

/**
 * Usage pricing as a control panel: drag the fader and add seats, the tier
 * lights move with you and the total rolls to the new number.
 */
export function PricingMeter({ className }: { className?: string }) {
  const [level, setLevel] = useState(52);
  const [seats, setSeats] = useState(4);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const requests = toRequests(level);
  const { tier, price } = quote(requests, seats, billing === "yearly");

  return (
    <section data-slot="pricing-meter" className={cn("bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <h2 className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-base-50 sm:text-6xl">
            Pay for what you <span className="font-serif font-normal tracking-[-0.02em] italic">turn up.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-pretty text-base-400">
            One meter, no tiers to decode. Set your traffic and your team; the panel tells you the price before you ask sales.
          </p>
          <ul className="mt-10 space-y-3">
            {["Every feature on every plan", "Usage billed to the request, never rounded up", "Cancel from the panel, no call needed"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-[15px] text-base-200">
                <span className="grid size-5 place-items-center rounded-full bg-signal/10 text-signal ring-1 ring-signal/20">
                  <Check className="size-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[32px] bg-base-950 p-2 shadow-[0_1px_0_white_inset,0_50px_80px_-50px_color-mix(in_oklab,var(--color-shade)_80%,transparent)] ring-1 ring-base-50/10 dark:shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_40px_80px_-30px_black]">
          {/* Tier lights */}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-t-[26px] bg-base-50/[0.07]">
            {tiers.map((t) => {
              const on = t.id === tier.id;
              return (
                <div key={t.id} className="bg-base-950 px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full transition-all duration-300",
                        on ? "bg-signal shadow-[0_0_10px_var(--signal)]" : "bg-base-50/15",
                      )}
                    />
                    <span className={cn("text-sm font-medium transition-colors", on ? "text-base-50" : "text-base-500")}>{t.name}</span>
                  </div>
                  <p className="mt-1.5 hidden text-xs text-base-500 sm:block">{t.note}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-8 rounded-b-[26px] p-6 ring-1 ring-base-50/[0.07] sm:p-8">
            <Fader
              label="Monthly requests"
              min={0}
              max={100}
              step={1}
              ticks={41}
              value={level}
              onValueChange={setLevel}
              format={(v) => compact(toRequests(v))}
              marks={["10k", "10M"]}
              className="max-w-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-base-100">Seats</p>
                  <p className="text-[13px] text-base-500">$9 each after the first</p>
                </div>
                <Stepper label="Seats" min={1} max={50} value={seats} onValueChange={setSeats} />
              </div>
              <SegmentedControl
                aria-label="Billing"
                size="sm"
                value={billing}
                onValueChange={setBilling}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly", badge: "−20%" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-base-50/[0.07] pt-8">
              <div>
                <p className="text-sm text-base-500">{tier.name} plan, estimated</p>
                <p className="mt-2 flex items-baseline gap-2 text-6xl font-semibold tracking-[-0.04em] text-base-50">
                  <RollingNumber value={`$${price.toLocaleString("en-US")}`} />
                  <span className="text-base font-normal tracking-normal text-base-500">/ month</span>
                </p>
              </div>
              <Keycap tone={tier.id === "scale" ? "ink" : "signal"} size="lg" legend={<CornerDownLeft />}>
                {tier.id === "hobby" ? "Start free" : tier.id === "pro" ? "Start with Pro" : "Talk to us"}
              </Keycap>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Demo() {
  return <PricingMeter />;
}
