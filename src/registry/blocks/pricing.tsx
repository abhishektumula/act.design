"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

export type Plan = {
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  cta: string;
  featured?: boolean;
};

const defaultPlans: Plan[] = [
  {
    name: "Hobby",
    description: "For side projects and experiments.",
    price: { monthly: 0, yearly: 0 },
    features: ["1 project", "10k requests / month", "Community support"],
    cta: "Start for free",
  },
  {
    name: "Pro",
    description: "For professionals shipping real products.",
    price: { monthly: 24, yearly: 19 },
    features: ["Unlimited projects", "2M requests / month", "Preview deployments", "Email support"],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Team",
    description: "For teams that need control and scale.",
    price: { monthly: 79, yearly: 64 },
    features: ["Everything in Pro", "SSO and audit logs", "99.99% SLA", "Dedicated Slack channel"],
    cta: "Contact sales",
  },
];

function BillingToggle({ value, onChange }: { value: Billing; onChange: (b: Billing) => void }) {
  const id = useId();
  return (
    <div className="inline-flex rounded-full bg-base-950 p-1 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/50">
      {(["monthly", "yearly"] as const).map((b) => (
        <button
          key={b}
          onClick={() => onChange(b)}
          className={cn(
            "relative flex h-8 items-center gap-2 rounded-full px-4 text-sm font-medium capitalize transition-colors",
            value === b ? "text-base-50" : "text-base-500 hover:text-base-300",
          )}
        >
          {value === b && (
            <motion.span
              layoutId={`${id}-billing`}
              transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
              className="absolute inset-0 rounded-full bg-linear-to-b from-base-700 to-base-800 shadow-md shadow-shade/40 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/15"
            />
          )}
          <span className="relative">{b}</span>
          {b === "yearly" && (
            <span className="relative rounded-full bg-emerald-500/15 px-1.5 py-px text-[10px] text-emerald-600 dark:text-emerald-400">−20%</span>
          )}
        </button>
      ))}
    </div>
  );
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const price = plan.price[billing];
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl p-8",
        plan.featured
          ? "bg-base-900 shadow-2xl shadow-shade/50 ring-1 ring-base-50/15 inset-shadow-2xs inset-shadow-white/10 lg:-my-4 lg:py-12"
          : "bg-base-950 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5",
      )}
    >
      {plan.featured && (
        <>
          <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-linear-to-r from-transparent via-blue-500 to-transparent" />
          <span className="absolute top-8 right-8 inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-300">
            <Sparkles className="size-3" /> Popular
          </span>
        </>
      )}
      <h3 className="text-lg font-medium text-base-100">{plan.name}</h3>
      <p className="mt-1.5 text-sm text-base-500">{plan.description}</p>
      <p className="mt-8 flex items-baseline gap-1.5">
        <span className="text-5xl font-semibold tracking-[-0.04em] text-base-50">
          $<NumberTicker value={price} />
        </span>
        <span className="text-sm text-base-500">/ user / mo</span>
      </p>
      <p className="mt-1 h-5 text-xs text-base-600">{billing === "yearly" && price > 0 ? `Billed $${price * 12} yearly` : ""}</p>
      <a
        href="#"
        className={cn(
          "mt-8 inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium transition-transform active:scale-[0.98]",
          plan.featured
            ? "bg-linear-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-600 inset-shadow-2xs inset-shadow-white/30"
            : "bg-linear-to-b from-base-800 to-base-900 text-base-100 shadow-md shadow-shade/30 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10",
        )}
      >
        {plan.cta}
      </a>
      <ul className="mt-8 space-y-3 border-t border-base-50/5 pt-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-base-300">
            <span className="grid size-5 place-items-center rounded-full bg-base-800 ring-1 ring-base-50/10">
              <Check className="size-3 text-base-200" />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pricing({
  plans = defaultPlans,
  title = "Simple pricing that scales with you.",
  className,
}: {
  plans?: Plan[];
  title?: string;
  className?: string;
}) {
  const [billing, setBilling] = useState<Billing>("yearly");

  return (
    <section data-slot="pricing" className={cn("bg-canvas px-6 py-24", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-5xl">{title}</h2>
          <p className="mt-4 text-lg text-base-400">Start free. Upgrade when it clicks.</p>
          <div className="mt-10">
            <BillingToggle value={billing} onChange={setBilling} />
          </div>
        </div>
        <div className="mt-16 grid items-center gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.name} plan={p} billing={billing} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <Pricing />;
}
