"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { Building2, Rocket, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; title: string; body: string; price: string; icon: LucideIcon };

export function RadioCards({
  options,
  value,
  onChange,
  className,
  itemClassName,
  indicatorClassName,
}: {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  itemClassName?: string;
  /** The ring that glides to the selected card. */
  indicatorClassName?: string;
}) {
  const id = useId();
  return (
    <div role="radiogroup" data-slot="radio-cards" className={cn("flex w-full flex-col gap-2", className)}>
      {options.map((o) => {
        const selected = o.id === value;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.id)}
            className={cn("relative flex items-center gap-3.5 rounded-2xl bg-base-900/60 p-4 text-left ring-1 ring-base-50/5 outline-none transition-colors hover:bg-base-900 focus-visible:ring-blue-500/60", itemClassName)}
          >
            {selected && (
              <motion.span
                layoutId={`${id}-ring`}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                className={cn("absolute inset-0 rounded-2xl bg-blue-500/5 ring-1 ring-blue-500/70 shadow-lg shadow-blue-500/10", indicatorClassName)}
              />
            )}
            <span
              className={`relative grid size-9 place-items-center rounded-xl ring-1 transition-colors ${
                selected ? "bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-blue-500/30" : "bg-base-800 text-base-400 ring-base-50/5"
              }`}
            >
              <Icon className="size-4" />
            </span>
            <span className="relative flex-1">
              <span className="block text-sm font-medium text-base-100">{o.title}</span>
              <span className="block text-xs text-base-500">{o.body}</span>
            </span>
            <span className="relative text-sm text-base-300 tabular-nums">{o.price}</span>
            <span
              className={`relative grid size-4 place-items-center rounded-full ring-1 transition-colors ${
                selected ? "bg-blue-500 ring-blue-500" : "ring-base-50/20"
              }`}
            >
              <motion.span
                initial={false}
                animate={{ scale: selected ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                className="size-1.5 rounded-full bg-white"
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

const plans: Option[] = [
  { id: "solo", title: "Solo", body: "For personal projects", price: "$0", icon: User },
  { id: "team", title: "Team", body: "Up to 10 collaborators", price: "$24", icon: Rocket },
  { id: "org", title: "Organization", body: "SSO, audit logs, SLA", price: "$99", icon: Building2 },
];

export default function Demo() {
  const [value, setValue] = useState("team");
  return (
    <div className="w-full max-w-sm">
      <RadioCards options={plans} value={value} onChange={setValue} />
    </div>
  );
}
