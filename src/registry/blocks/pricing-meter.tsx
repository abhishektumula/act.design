"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fader } from "@/components/ui/fader";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { RollingNumber, Stepper } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

type Interval = "180" | "60" | "30" | "10";

const tiers = [
  { id: "free", name: "Free", base: 0, monitors: 10, seats: 1, extraMonitor: 0, extraSeat: 0, fastest: 180, note: "10 monitors, 3-minute checks" },
  { id: "team", name: "Team", base: 29, monitors: 50, seats: 3, extraMonitor: 0.4, extraSeat: 10, fastest: 30, note: "50 monitors, 3 seats included" },
  { id: "business", name: "Business", base: 119, monitors: 250, seats: 10, extraMonitor: 0.3, extraSeat: 10, fastest: 10, note: "250 monitors, 10-second checks" },
] as const;

/** Fader stops for the number of monitors. */
const stops = [1, 3, 5, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000];

function quote(monitors: number, seats: number, interval: number, yearly: boolean) {
  // Free covers small setups; 10-second checks or more than 150 monitors need Business.
  const tier = monitors <= 10 && seats === 1 && interval >= 180 ? tiers[0] : interval >= 30 && monitors <= 150 ? tiers[1] : tiers[2];
  const monthly =
    tier.base + Math.max(0, monitors - tier.monitors) * tier.extraMonitor + Math.max(0, seats - tier.seats) * tier.extraSeat;
  return { tier, price: Math.round(yearly ? (monthly * 10) / 12 : monthly) };
}

/**
 * Usage pricing as a set of controls: monitors, check frequency and seats.
 * The plan lights follow and the total rolls to its new number.
 */
export function PricingMeter({ className }: { className?: string }) {
  const [stop, setStop] = useState(8);
  const [interval, setInterval] = useState<Interval>("30");
  const [seats, setSeats] = useState(4);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const monitors = stops[stop];
  const { tier, price } = quote(monitors, seats, Number(interval), billing === "yearly");

  return (
    <section data-slot="pricing-meter" className={cn("bg-canvas px-6 py-24 sm:py-32", className)}>
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <h2 className="text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-base-50 sm:text-6xl">
            Pay for what you <span className="font-serif font-normal tracking-[-0.01em] italic">watch.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-pretty text-base-400">
            Tell us how many endpoints you watch and how often. You see the price before you talk to anyone.
          </p>
          <ul className="mt-10 space-y-3">
            {["Status pages and SSL checks on every plan", "Phone, SMS and Slack alerts with no per-alert fees", "Cancel any time from settings"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-[15px] text-base-200">
                <span className="grid size-5 place-items-center rounded-full bg-signal/10 text-signal ring-1 ring-signal/20">
                  <Check className="size-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] bg-base-950 p-2 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_30px_60px_-40px_var(--color-shade)] ring-1 ring-base-50/10 dark:bg-base-900">
          {/* Plan lights */}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-t-[22px] bg-base-50/[0.07]">
            {tiers.map((t) => {
              const on = t.id === tier.id;
              return (
                <div key={t.id} className="bg-base-950 px-4 py-4 sm:px-5 dark:bg-base-900">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full transition-all duration-300", on ? "bg-signal shadow-[0_0_10px_var(--signal)]" : "bg-base-50/15")} />
                    <span className={cn("text-sm font-medium transition-colors", on ? "text-base-50" : "text-base-500")}>{t.name}</span>
                  </div>
                  <p className="mt-1.5 hidden text-xs text-base-500 sm:block">{t.note}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-8 rounded-b-[22px] p-6 ring-1 ring-base-50/[0.07] sm:p-8">
            <Fader
              label="Monitors"
              min={0}
              max={stops.length - 1}
              step={1}
              ticks={37}
              value={stop}
              onValueChange={setStop}
              format={(v) => `${stops[v]} ${stops[v] === 1 ? "monitor" : "monitors"}`}
              marks={["1", "1,000"]}
              className="max-w-none"
            />

            <div>
              <p className="mb-3 text-sm font-medium text-base-100">Check every</p>
              <SegmentedControl<Interval>
                aria-label="Check interval"
                size="sm"
                value={interval}
                onValueChange={setInterval}
                options={[
                  { value: "180", label: "3 min" },
                  { value: "60", label: "1 min" },
                  { value: "30", label: "30 sec" },
                  { value: "10", label: "10 sec" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-base-100">Seats</p>
                  <p className="text-[13px] text-base-500">$10 each after the {tier.seats} included</p>
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
                  { value: "yearly", label: "Yearly", badge: "2 months free" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-base-50/[0.07] pt-8">
              <div>
                <p className="text-sm text-base-500">{tier.name} plan</p>
                <p className="mt-1 flex items-baseline gap-2 text-6xl font-semibold tracking-[-0.04em] text-base-50">
                  <RollingNumber value={`$${price.toLocaleString("en-US")}`} />
                  <span className="text-base font-normal tracking-normal text-base-500">/ month</span>
                </p>
              </div>
              <Button tone={tier.id === "business" ? "ink" : "signal"} size="lg">
                {tier.id === "free" ? "Start free" : tier.id === "team" ? "Start a 14-day trial" : "Talk to sales"}
              </Button>
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
