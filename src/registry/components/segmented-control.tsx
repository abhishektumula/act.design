"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { CalendarDays, Columns3, GanttChart, List } from "lucide-react";
import { cn } from "@/lib/utils";

export const segmentedVariants = cva(
  "relative inline-flex items-center rounded-2xl bg-base-50/[0.06] p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-base-50/5",
  {
    variants: {
      size: {
        sm: "[&_[role=radio]]:h-7 [&_[role=radio]]:px-3 [&_[role=radio]]:text-xs",
        md: "[&_[role=radio]]:h-9 [&_[role=radio]]:px-4 [&_[role=radio]]:text-sm",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type Segment<T extends string> = { value: T; label: ReactNode; icon?: ReactNode; badge?: ReactNode };

/**
 * A row of options with a raised cap that glides to the pick. The cap sinks a
 * touch while you press and arrow keys move the selection.
 */
export function SegmentedControl<T extends string>({
  options,
  value: controlled,
  defaultValue,
  onValueChange,
  size,
  className,
  "aria-label": ariaLabel,
}: VariantProps<typeof segmentedVariants> & {
  options: Segment<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const id = useId();
  const [inner, setInner] = useState<T>(defaultValue ?? options[0].value);
  const value = controlled ?? inner;
  const [pressed, setPressed] = useState<T | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (v: T) => {
    if (controlled === undefined) setInner(v);
    onValueChange?.(v);
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + options.length) % options.length;
    select(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={ariaLabel} data-slot="segmented-control" className={cn(segmentedVariants({ size }), className)}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => select(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            onPointerDown={() => setPressed(o.value)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            className={cn(
              "relative flex items-center gap-2 rounded-xl font-medium whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-signal/60",
              active ? "text-base-50" : "text-base-500 hover:text-base-300",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-cap`}
                animate={{ scale: pressed === o.value ? 0.96 : 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.9 }}
                className="absolute inset-0 rounded-xl bg-linear-to-b from-white to-base-950 shadow-[0_1px_0_white_inset,0_1px_2px_rgb(0_0_0/0.12),0_4px_12px_-4px_rgb(0_0_0/0.2)] ring-1 ring-black/5 dark:from-base-700 dark:to-base-800 dark:shadow-[0_1px_0_rgb(255_255_255/0.1)_inset,0_2px_8px_rgb(0_0_0/0.4)] dark:ring-white/5"
              />
            )}
            {o.icon && <span className="relative [&_svg]:size-4">{o.icon}</span>}
            <span className="relative">{o.label}</span>
            {o.badge && (
              <span
                className={cn(
                  "relative rounded-full px-1.5 py-px font-mono text-[10px] transition-colors",
                  active ? "bg-signal text-white" : "bg-base-50/10 text-base-500",
                )}
              >
                {o.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function Demo() {
  const [view, setView] = useState("board");
  return (
    <div className="flex flex-col items-center gap-6">
      <SegmentedControl
        aria-label="View"
        value={view}
        onValueChange={setView}
        options={[
          { value: "list", label: "List", icon: <List /> },
          { value: "board", label: "Board", icon: <Columns3 /> },
          { value: "calendar", label: "Calendar", icon: <CalendarDays /> },
          { value: "timeline", label: "Timeline", icon: <GanttChart /> },
        ]}
      />
      <SegmentedControl
        aria-label="Billing"
        size="sm"
        defaultValue="yearly"
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly", badge: "−20%" },
        ]}
      />
    </div>
  );
}
